import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { OqHangulPadComponent } from './hangul-pad.component';

const { writerInstanceMock, hangulWriterCreateMock } = vi.hoisted(() => {
  const instance = {
    animateCharacter: vi.fn().mockResolvedValue({ canceled: false }),
    quiz: vi.fn().mockResolvedValue(undefined),
    cancelQuiz: vi.fn(),
  };
  return {
    writerInstanceMock: instance,
    hangulWriterCreateMock: vi.fn(() => instance),
  };
});

vi.mock('hangul-writer', () => ({
  default: {
    create: hangulWriterCreateMock,
  },
}));

@Component({
  imports: [OqHangulPadComponent],
  template: `
    <oq-hangul-pad
      [expectedText]="expectedText()"
      [initialTab]="initialTab()"
      [allowGuideTab]="allowGuideTab()"
      (textSelected)="picked = $event"
    />
  `,
})
class TestHangulHostComponent {
  readonly expectedText = signal('안녕');
  readonly initialTab = signal<'guide' | 'freehand'>('guide');
  readonly allowGuideTab = signal(true);
  picked: string | null = null;
}

describe('OqHangulPadComponent', () => {
  let httpTesting: HttpTestingController;
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let originalToBlob: typeof HTMLCanvasElement.prototype.toBlob;

  beforeEach(async () => {
    hangulWriterCreateMock.mockClear();
    writerInstanceMock.animateCharacter.mockClear();
    writerInstanceMock.quiz.mockClear();
    writerInstanceMock.cancelQuiz.mockClear();

    originalGetContext = HTMLCanvasElement.prototype.getContext;
    originalToBlob = HTMLCanvasElement.prototype.toBlob;

    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      setTransform: vi.fn(),
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 6,
      lineCap: 'round',
      lineJoin: 'round',
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    HTMLCanvasElement.prototype.toBlob = function (callback: BlobCallback) {
      callback(new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' }));
    };

    await TestBed.configureTestingModule({
      imports: [TestHangulHostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  });

  it('mounts hangul-writer stroke guide per syllable and triggers quiz mode', async () => {
    const fixture = TestBed.createComponent(TestHangulHostComponent);
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 15));
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const syllableBtns = el.querySelectorAll<HTMLButtonElement>('.hw-syllable-btn');
    expect(syllableBtns.length).toBe(2);
    expect(syllableBtns[0].textContent?.trim()).toBe('안');
    expect(syllableBtns[1].textContent?.trim()).toBe('녕');
    expect(hangulWriterCreateMock).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      '안',
      expect.any(Object),
    );

    const traceBtn = Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes('Trace Practice'),
    )!;
    traceBtn.click();
    fixture.detectChanges();
    expect(writerInstanceMock.quiz).toHaveBeenCalledTimes(1);

    syllableBtns[1].click();
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 15));
    expect(hangulWriterCreateMock).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      '녕',
      expect.any(Object),
    );

    const freehandTab = Array.from(el.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find(
      (b) => b.textContent?.includes('Freehand Draw'),
    )!;
    freehandTab.click();
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 15));
    fixture.detectChanges();

    expect(freehandTab.getAttribute('aria-selected')).toBe('true');
    expect(el.querySelector('canvas.hw-canvas')).toBeTruthy();
  });

  it('records freehand strokes, calls AI recognition, displays feedback, and emits selected candidate', async () => {
    const fixture = TestBed.createComponent(TestHangulHostComponent);
    fixture.componentInstance.initialTab.set('freehand');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const canvas = el.querySelector<HTMLCanvasElement>('.hw-canvas')!;
    expect(canvas).toBeTruthy();

    // Pointer Events drawing in JSDOM
    canvas.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, clientX: 20, clientY: 20 }),
    );
    canvas.dispatchEvent(
      new MouseEvent('pointermove', { bubbles: true, clientX: 60, clientY: 50 }),
    );
    canvas.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 60, clientY: 50 }));
    fixture.detectChanges();

    const padInstance = fixture.debugElement.children[0].componentInstance as OqHangulPadComponent;
    expect(padInstance.strokeCount()).toBe(1);

    const checkBtn = Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes('Check Writing (AI)'),
    )!;
    checkBtn.click();
    await new Promise((r) => setTimeout(r, 10));

    const req = httpTesting.expectOne(
      (r) => r.url.endsWith('/ai/handwriting/recognize') && r.method === 'POST',
    );
    expect(req.request.body instanceof FormData).toBe(true);
    const body = req.request.body as FormData;
    expect(body.get('expectedText')).toBe('안녕');
    expect(body.get('mode')).toBe('evaluate');

    req.flush({
      data: {
        model: 'vision-model',
        recognizedText: '안녕',
        candidates: ['안녕', '안영'],
        isMatch: true,
        feedback: 'Well-balanced Hangul blocks.',
      },
    });
    fixture.detectChanges();

    expect(el.textContent).toContain('Matches target');
    expect(el.textContent).toContain('Well-balanced Hangul blocks.');

    const candidateChip = Array.from(el.querySelectorAll<HTMLButtonElement>('.hw-chip')).find(
      (b) => b.textContent?.trim() === '안영',
    )!;
    candidateChip.click();
    expect(fixture.componentInstance.picked).toBe('안영');

    padInstance.undoStroke();
    expect(padInstance.strokeCount()).toBe(0);
  });
});
