import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type HangulWriter from 'hangul-writer';
import { AiApiService } from '../../../features/ai-tutor/ai-api.service';
import { TranslatePipe, I18nService } from '../../i18n';
import { SpeechService } from '../../services/speech.service';
import { type RecognizeHandwritingResult } from '../../types/ai.types';
import { extractApiError } from '../../utils/api-error.util';
import { extractHangulCharacters } from '../../utils/hangul.util';
import { OqIconComponent } from '../icon/icon.component';

interface StrokePoint {
  x: number;
  y: number;
}

type StrokePath = StrokePoint[];

const GUIDE_BOX_SIZE = 340;
const DEFAULT_CANVAS_LOGICAL_WIDTH = 800;
const DEFAULT_CANVAS_LOGICAL_HEIGHT = 480;

@Component({
  selector: 'oq-hangul-pad',
  imports: [CommonModule, OqIconComponent, TranslatePipe],
  templateUrl: './hangul-pad.component.html',
  styleUrl: './hangul-pad.component.scss',
})
export class OqHangulPadComponent implements AfterViewInit {
  private readonly aiApi = inject(AiApiService);
  private readonly i18n = inject(I18nService);
  private readonly destroyRef = inject(DestroyRef);
  readonly speech = inject(SpeechService);

  readonly expectedText = input<string>('');
  readonly initialTab = input<'guide' | 'freehand'>('guide');
  readonly allowGuideTab = input<boolean>(true);
  readonly compact = input<boolean>(false);
  readonly applyActionLabel = input<string | null>(null);

  readonly textSelected = output<string>();
  readonly evaluated = output<RecognizeHandwritingResult>();

  private readonly writerHost = viewChild<ElementRef<HTMLDivElement>>('writerHost');
  private readonly drawCanvas = viewChild<ElementRef<HTMLCanvasElement>>('drawCanvas');

  readonly targetSyllables = computed(() => extractHangulCharacters(this.expectedText()));
  readonly hasGuideSupport = computed(
    () => this.allowGuideTab() && this.targetSyllables().length > 0,
  );
  private readonly tabOverride = signal<'guide' | 'freehand' | null>(null);
  readonly activeTab = computed<'guide' | 'freehand'>(() => {
    if (!this.hasGuideSupport()) return 'freehand';
    return this.tabOverride() ?? this.initialTab();
  });
  readonly selectedSyllableIndex = signal(0);
  readonly activeSyllable = computed(() => {
    const syllables = this.targetSyllables();
    if (syllables.length === 0) return '';
    const idx = Math.min(this.selectedSyllableIndex(), syllables.length - 1);
    return syllables[idx];
  });

  // Stroke-order guide state
  readonly quizActive = signal(false);
  readonly quizMistakes = signal(0);
  readonly quizCompleted = signal(false);
  readonly quizHint = signal<string | null>(null);

  // Freehand canvas + AI state
  readonly strokeCount = signal(0);
  readonly recognizing = signal(false);
  readonly aiError = signal<string | null>(null);
  readonly result = signal<RecognizeHandwritingResult | null>(null);
  readonly selectedCandidate = signal<string | null>(null);

  private strokes: StrokePath[] = [];
  private activeStroke: StrokePath | null = null;
  private isDrawing = false;
  private canvasLogicalWidth = DEFAULT_CANVAS_LOGICAL_WIDTH;
  private canvasLogicalHeight = DEFAULT_CANVAS_LOGICAL_HEIGHT;
  private writer: HangulWriter | null = null;
  private renderToken = 0;
  private readonly viewReady = signal(false);
  private destroyed = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.teardownWriter();
    });

    effect(() => {
      const expected = this.expectedText();
      void expected;
      untracked(() => {
        this.tabOverride.set(null);
        this.selectedSyllableIndex.set(0);
        this.clearCanvas();
      });
    });

    effect(() => {
      const ready = this.viewReady();
      const tab = this.activeTab();
      const syllable = this.activeSyllable();
      const hostRef = this.writerHost();
      const canvasRef = this.drawCanvas();
      if (!ready) {
        return;
      }

      untracked(() => {
        if (tab === 'guide' && hostRef && syllable) {
          void this.mountWriter(hostRef.nativeElement, syllable);
        } else {
          this.teardownWriter();
        }

        if (tab === 'freehand' && canvasRef) {
          this.syncCanvasResolution(canvasRef.nativeElement);
        }
      });
    });
  }

  ngAfterViewInit(): void {
    this.viewReady.set(true);
  }

  switchTab(tab: 'guide' | 'freehand'): void {
    if (tab === 'guide' && !this.hasGuideSupport()) {
      return;
    }
    this.tabOverride.set(tab);
  }

  selectSyllable(index: number): void {
    this.selectedSyllableIndex.set(index);
  }

  animateStrokes(): void {
    if (!this.writer) return;
    this.quizActive.set(false);
    this.quizCompleted.set(false);
    this.quizHint.set(null);
    this.writer.cancelQuiz();
    void this.writer.animateCharacter();
  }

  startTraceQuiz(): void {
    if (!this.writer) return;
    this.quizActive.set(true);
    this.quizCompleted.set(false);
    this.quizMistakes.set(0);
    this.quizHint.set(null);

    void this.writer.quiz({
      leniency: 1.25,
      showHintAfterMisses: 2,
      acceptBackwardsStrokes: false,
      onCorrectStroke: () => {
        this.quizHint.set(null);
      },
      onMistake: (data) => {
        this.quizMistakes.set(data.totalMistakes);
        if (data.isBackwards) {
          this.quizHint.set(this.i18n.t('hw.quizBackwardHint'));
        }
      },
      onComplete: (summary) => {
        this.quizActive.set(false);
        this.quizCompleted.set(true);
        this.quizMistakes.set(summary.totalMistakes);
        this.quizHint.set(null);
      },
    });
  }

  onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 && event.pointerType === 'mouse') {
      return;
    }
    const canvas = this.drawCanvas()?.nativeElement;
    if (!canvas) return;

    this.syncCanvasResolution(canvas);
    canvas.setPointerCapture?.(event.pointerId);
    const point = this.toCanvasPoint(canvas, event);
    this.isDrawing = true;
    this.activeStroke = [point];
    this.strokes.push(this.activeStroke);
    this.strokeCount.set(this.strokes.length);
    this.aiError.set(null);
    this.redrawCanvas();
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDrawing || !this.activeStroke) return;
    const canvas = this.drawCanvas()?.nativeElement;
    if (!canvas) return;
    const point = this.toCanvasPoint(canvas, event);
    const last = this.activeStroke[this.activeStroke.length - 1];
    if (!last || Math.hypot(point.x - last.x, point.y - last.y) >= 1.5) {
      this.activeStroke.push(point);
      this.redrawCanvas();
    }
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.isDrawing) return;
    const canvas = this.drawCanvas()?.nativeElement;
    canvas?.releasePointerCapture?.(event.pointerId);
    this.isDrawing = false;
    this.activeStroke = null;
    this.redrawCanvas();
  }

  undoStroke(): void {
    if (this.strokes.length === 0) return;
    this.strokes.pop();
    this.strokeCount.set(this.strokes.length);
    this.aiError.set(null);
    this.redrawCanvas();
  }

  clearCanvas(): void {
    this.strokes = [];
    this.activeStroke = null;
    this.isDrawing = false;
    this.strokeCount.set(0);
    this.aiError.set(null);
    this.result.set(null);
    this.selectedCandidate.set(null);
    this.redrawCanvas();
  }

  speakText(text: string): void {
    const clean = text.trim();
    if (!clean) return;
    this.speech.speak(clean, 'hw-speak', 0.85, 'ko');
  }

  selectCandidate(candidate: string): void {
    this.selectedCandidate.set(candidate);
    this.textSelected.emit(candidate);
  }

  recognizeDrawing(): void {
    if (this.recognizing()) return;
    if (this.strokes.length === 0) {
      this.aiError.set(this.i18n.t('hw.freehandEmptyErr'));
      return;
    }

    this.recognizing.set(true);
    this.aiError.set(null);

    void this.exportInkPngBlob()
      .then((blob) => {
        if (!blob) {
          this.recognizing.set(false);
          this.aiError.set(this.i18n.t('hw.freehandEmptyErr'));
          return;
        }
        const target = this.expectedText().trim();
        this.aiApi
          .recognizeHandwriting(blob, {
            expectedText: target || undefined,
            explanationLang: this.i18n.lang(),
            mode: target ? 'evaluate' : 'recognize',
          })
          .subscribe({
            next: (res) => {
              this.recognizing.set(false);
              this.result.set(res);
              this.selectedCandidate.set(res.recognizedText || res.candidates[0] || null);
              this.evaluated.emit(res);
            },
            error: (err) => {
              this.recognizing.set(false);
              this.aiError.set(extractApiError(err));
            },
          });
      })
      .catch(() => {
        this.recognizing.set(false);
        this.aiError.set(this.i18n.t('hw.freehandEmptyErr'));
      });
  }

  private async mountWriter(host: HTMLDivElement, char: string): Promise<void> {
    this.teardownWriter();
    const token = ++this.renderToken;
    host.innerHTML = '';
    this.quizActive.set(false);
    this.quizMistakes.set(0);
    this.quizCompleted.set(false);
    this.quizHint.set(null);

    try {
      const mod = (await import('hangul-writer')) as { default?: typeof HangulWriter };
      if (this.destroyed || token !== this.renderToken) {
        return;
      }
      const HangulWriterCtor = mod.default ?? (mod as unknown as typeof HangulWriter);
      const hostWidth = Math.round(host.getBoundingClientRect().width);
      const boxSize = hostWidth > 40 ? Math.min(GUIDE_BOX_SIZE, hostWidth) : GUIDE_BOX_SIZE;
      const instance = HangulWriterCtor.create(host, char, {
        width: boxSize,
        height: boxSize,
        padding: 22,
        showOutline: true,
        showCharacter: true,
        strokeColor: '#172033',
        outlineColor: '#cbd5e1',
        highlightColor: '#f04470',
        drawingColor: '#f04470',
        radicalColor: '#0369a1',
        drawingWidth: 11,
        strokeAnimationSpeed: 1.25,
        delayBetweenStrokes: 240,
      });
      this.writer = instance;
      void instance.animateCharacter();
    } catch {
      // Fallback: display clean character preview if dynamic chunk load fails in restricted environments
      if (!this.destroyed && token === this.renderToken) {
        host.textContent = char;
      }
    }
  }

  private teardownWriter(): void {
    this.renderToken += 1;
    if (this.writer) {
      try {
        this.writer.cancelQuiz();
      } catch {
        // Ignore cleanup errors when SVG target already detached
      }
      this.writer = null;
    }
    const host = this.writerHost()?.nativeElement;
    if (host) {
      host.innerHTML = '';
    }
  }

  private syncCanvasResolution(canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect();
    const logicalWidth = rect.width > 40 ? Math.round(rect.width) : DEFAULT_CANVAS_LOGICAL_WIDTH;
    const logicalHeight =
      rect.height > 40
        ? Math.round(rect.height)
        : this.compact()
          ? 400
          : DEFAULT_CANVAS_LOGICAL_HEIGHT;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    this.canvasLogicalWidth = logicalWidth;
    this.canvasLogicalHeight = logicalHeight;

    const targetWidth = Math.round(logicalWidth * dpr);
    const targetHeight = Math.round(logicalHeight * dpr);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    const ctx = canvas.getContext('2d');
    if (ctx && typeof ctx.setTransform === 'function') {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    this.redrawCanvas();
  }

  private toCanvasPoint(canvas: HTMLCanvasElement, event: PointerEvent): StrokePoint {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || this.canvasLogicalWidth;
    const height = rect.height || this.canvasLogicalHeight;
    return {
      x: ((event.clientX - rect.left) / width) * this.canvasLogicalWidth,
      y: ((event.clientY - rect.top) / height) * this.canvasLogicalHeight,
    };
  }

  private redrawCanvas(): void {
    const canvas = this.drawCanvas()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    ctx.save?.();
    ctx.setTransform?.(1, 0, 0, 1, 0, 0);
    // Paint opaque paper explicitly so Chromium Skia always invalidates the composited canvas layer on Clear/Undo.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore?.();
    ctx.setTransform?.(dpr, 0, 0, dpr, 0, 0);
    renderStrokesOnContext(ctx, this.strokes, '#111827', 9);
  }

  private async exportInkPngBlob(): Promise<Blob | null> {
    if (typeof document === 'undefined' || this.strokes.length === 0) {
      return null;
    }
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = this.canvasLogicalWidth;
    exportCanvas.height = this.canvasLogicalHeight;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    // Pure opaque white background + bold dark ink guarantees high Vision OCR accuracy
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    renderStrokesOnContext(ctx, this.strokes, '#000000', 13);

    return await new Promise<Blob | null>((resolve) => {
      if (typeof exportCanvas.toBlob === 'function') {
        exportCanvas.toBlob((blob) => resolve(blob), 'image/png');
      } else {
        resolve(null);
      }
    });
  }
}

function renderStrokesOnContext(
  ctx: CanvasRenderingContext2D,
  strokes: StrokePath[],
  color: string,
  lineWidth: number,
): void {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const stroke of strokes) {
    if (stroke.length === 0) continue;
    if (stroke.length === 1) {
      ctx.beginPath();
      ctx.arc(stroke[0].x, stroke[0].y, lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);
    for (let i = 1; i < stroke.length - 1; i++) {
      const midX = (stroke[i].x + stroke[i + 1].x) / 2;
      const midY = (stroke[i].y + stroke[i + 1].y) / 2;
      ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, midX, midY);
    }
    const last = stroke[stroke.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }
}
