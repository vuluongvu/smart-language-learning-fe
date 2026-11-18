import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import {
  OqEmptyStateComponent,
  OqIconComponent,
  OqPageHeaderComponent,
  OqProgressBarComponent,
} from '../../shared/components';
import { I18nService, TranslatePipe } from '../../shared/i18n';
import { OqMarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { SpeechService } from '../../shared/services/speech.service';
import {
  AiConversationSessionDetail,
  ConversationSuggestedWord,
} from '../../shared/types/ai.types';
import {
  LearningPathUnitDetail,
  UnitQuizSubmissionResult,
} from '../../shared/types/learning-path.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { AiApiService } from '../ai-tutor/ai-api.service';
import { AiConversationComponent } from '../ai-tutor/ai-conversation.component';
import { FlashcardsApiService } from '../flashcards/flashcards-api.service';
import { LearningPathApiService } from './learning-path-api.service';
import { LpTranslatePipe, lpTranslate } from './learning-path.i18n';

export type UnitSkillTab = 'vocab' | 'quiz' | 'writing' | 'speaking';

@Component({
  selector: 'app-learning-unit',
  imports: [
    OqPageHeaderComponent,
    OqProgressBarComponent,
    OqEmptyStateComponent,
    OqIconComponent,
    AiConversationComponent,
    TranslatePipe,
    LpTranslatePipe,
    OqMarkdownPipe,
  ],
  templateUrl: './learning-unit.component.html',
  styleUrl: './learning-unit.component.scss',
})
export class LearningUnitComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pathApi = inject(LearningPathApiService);
  private readonly flashcardsApi = inject(FlashcardsApiService);
  private readonly aiApi = inject(AiApiService);
  protected readonly speech = inject(SpeechService);
  protected readonly i18n = inject(I18nService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly actionMessage = signal<string | null>(null);
  protected readonly detail = signal<LearningPathUnitDetail | null>(null);
  protected readonly activeTab = signal<UnitSkillTab>('vocab');
  protected readonly aiEnabled = signal(false);

  // Step 1: Vocabulary + Flashcards
  protected readonly syncingVocab = signal(false);
  protected readonly launchingCards = signal(false);

  // Step 2: Listening & Reading Quiz
  protected readonly showTranscript = signal(false);
  protected readonly showTranslation = signal(false);
  protected readonly selectedAnswers = signal<Record<string, number>>({});
  protected readonly submittingQuiz = signal(false);
  protected readonly quizResult = signal<UnitQuizSubmissionResult | null>(null);

  // Step 3: Writing AI
  protected readonly writingDraft = signal('');
  protected readonly evaluatingWriting = signal(false);
  protected readonly showSampleWriting = signal(false);
  protected readonly savedSuggestedTerms = signal<Set<string>>(new Set());
  protected readonly savingSuggestedTerm = signal<string | null>(null);

  // AI Study Material
  protected readonly showStudyGuide = signal(false);
  protected readonly guideFocusGoal = signal('');
  protected readonly generatingStudyGuide = signal(false);
  protected readonly regeneratingUnit = signal(false);

  // Step 4: Speaking AI
  protected readonly startingSpeaking = signal(false);
  protected readonly speakingSession = signal<AiConversationSessionDetail | null>(null);
  protected readonly completingSpeaking = signal(false);

  protected readonly usedTermsInDraft = computed(() => {
    const terms = this.detail()?.writing.targetTerms ?? [];
    const lower = this.writingDraft().toLowerCase();
    return new Set(terms.filter((t) => lower.includes(t.toLowerCase())));
  });

  protected readonly canSubmitQuiz = computed(() => {
    const questions = this.detail()?.readingListening.questions ?? [];
    const answers = this.selectedAnswers();
    return questions.length > 0 && questions.every((q) => answers[q.id] !== undefined);
  });

  protected readonly canSubmitWriting = computed(
    () => this.aiEnabled() && !this.evaluatingWriting() && this.writingDraft().trim().length >= 10,
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.speech.stopSpeaking();
    });
  }

  ngOnInit(): void {
    this.aiApi
      .getStatus()
      .pipe(catchError(() => of({ enabled: false, model: '' })))
      .subscribe((st) => this.aiEnabled.set(st.enabled === true));

    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (Number.isFinite(id) && id > 0) {
        this.loadUnit(id);
      } else {
        this.loading.set(false);
        this.errorMessage.set('Invalid unit id');
      }
    });
  }

  loadUnit(unitId: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.actionMessage.set(null);
    this.quizResult.set(null);
    this.selectedAnswers.set({});
    this.speakingSession.set(null);

    this.pathApi.getUnitDetail(unitId).subscribe({
      next: (data) => {
        this.detail.set(data);
        this.showStudyGuide.set(Boolean(data.studyGuide));
        if (data.progress.writingSubmission) {
          this.writingDraft.set(data.progress.writingSubmission);
        } else {
          this.writingDraft.set('');
        }
        if (data.progress.speakingSessionId && this.aiEnabled()) {
          this.aiApi
            .getConversation(data.progress.speakingSessionId)
            .pipe(catchError(() => of(null)))
            .subscribe((sess) => {
              if (sess) {
                this.speakingSession.set(sess);
              }
            });
        }
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể tải nội dung bài học.'
              : 'Unable to load learning unit.',
          ),
        );
      },
    });
  }

  selectTab(tab: UnitSkillTab): void {
    this.speech.stopSpeaking();
    this.actionMessage.set(null);
    this.activeTab.set(tab);
  }

  speakAudio(text: string, id: string, rate = 0.95): void {
    this.speech.speak(text, id, rate);
  }

  syncVocabToNotebook(): void {
    const current = this.detail();
    if (!current || this.syncingVocab()) {
      return;
    }

    this.syncingVocab.set(true);
    this.errorMessage.set(null);

    this.pathApi.syncUnitVocab(current.id).subscribe({
      next: (res) => {
        this.syncingVocab.set(false);
        this.detail.update((d) =>
          d
            ? {
                ...d,
                vocabulary: d.vocabulary.map((w) => ({ ...w, inNotebook: true })),
                progress: res.progress,
              }
            : null,
        );
        this.actionMessage.set(
          lpTranslate(this.i18n.lang(), 'lpu.vocabSyncedMsg', {
            added: res.addedCount,
            topic: res.topicName,
          }),
        );
      },
      error: (err: unknown) => {
        this.syncingVocab.set(false);
        this.errorMessage.set(extractApiError(err, 'Unable to save vocabulary.'));
      },
    });
  }

  launchUnitFlashcards(): void {
    const current = this.detail();
    if (!current || this.launchingCards()) {
      return;
    }

    this.launchingCards.set(true);
    const openForTopic = (topicId: number) => {
      this.flashcardsApi.createSession({ topicId, mode: 'due_and_new', limit: 20 }).subscribe({
        next: (session) => {
          this.launchingCards.set(false);
          this.router.navigate(['/flashcards/sessions', session.id]);
        },
        error: (err: unknown) => {
          this.launchingCards.set(false);
          this.errorMessage.set(extractApiError(err, 'Unable to open flashcards.'));
        },
      });
    };

    if (current.progress.topicId) {
      openForTopic(current.progress.topicId);
      return;
    }

    this.pathApi.syncUnitVocab(current.id).subscribe({
      next: (res) => {
        this.detail.update((d) =>
          d
            ? {
                ...d,
                vocabulary: d.vocabulary.map((w) => ({ ...w, inNotebook: true })),
                progress: res.progress,
              }
            : null,
        );
        openForTopic(res.topicId);
      },
      error: (err: unknown) => {
        this.launchingCards.set(false);
        this.errorMessage.set(extractApiError(err, 'Unable to sync notebook first.'));
      },
    });
  }

  chooseOption(questionId: string, optionIdx: number): void {
    this.selectedAnswers.update((curr) => ({ ...curr, [questionId]: optionIdx }));
  }

  submitQuiz(): void {
    const current = this.detail();
    if (!current || !this.canSubmitQuiz() || this.submittingQuiz()) {
      return;
    }

    const answers = current.readingListening.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: this.selectedAnswers()[q.id],
    }));

    this.submittingQuiz.set(true);
    this.errorMessage.set(null);

    this.pathApi.submitUnitQuiz(current.id, answers).subscribe({
      next: (res) => {
        this.submittingQuiz.set(false);
        this.quizResult.set(res);
        this.detail.update((d) => (d ? { ...d, progress: res.progress } : null));
      },
      error: (err: unknown) => {
        this.submittingQuiz.set(false);
        this.errorMessage.set(extractApiError(err, 'Unable to submit quiz.'));
      },
    });
  }

  quizResultFor(questionId: string) {
    return this.quizResult()?.results.find((r) => r.questionId === questionId) ?? null;
  }

  onWritingInput(event: Event): void {
    this.writingDraft.set((event.target as HTMLTextAreaElement).value);
  }

  submitWriting(): void {
    const current = this.detail();
    if (!current || !this.canSubmitWriting()) {
      return;
    }

    this.evaluatingWriting.set(true);
    this.errorMessage.set(null);

    this.pathApi
      .evaluateUnitWriting(current.id, this.writingDraft().trim(), this.i18n.lang())
      .subscribe({
        next: (res) => {
          this.evaluatingWriting.set(false);
          this.detail.update((d) => (d ? { ...d, progress: res.progress } : null));
        },
        error: (err: unknown) => {
          this.evaluatingWriting.set(false);
          this.errorMessage.set(extractApiError(err, 'Unable to evaluate writing.'));
        },
      });
  }

  saveSuggestedWord(word: ConversationSuggestedWord): void {
    const current = this.detail();
    if (!current) {
      return;
    }
    const key = word.term.toLowerCase();
    if (this.savedSuggestedTerms().has(key) || this.savingSuggestedTerm() === key) {
      return;
    }

    this.savingSuggestedTerm.set(key);
    this.pathApi.saveUnitWords(current.id, [word]).subscribe({
      next: () => {
        this.savingSuggestedTerm.set(null);
        this.savedSuggestedTerms.update((prev) => new Set([...prev, key]));
      },
      error: (err: unknown) => {
        this.savingSuggestedTerm.set(null);
        this.errorMessage.set(extractApiError(err, 'Unable to save word.'));
      },
    });
  }

  isSuggestedSaved(term: string): boolean {
    return this.savedSuggestedTerms().has(term.toLowerCase());
  }

  startSpeakingPractice(): void {
    const current = this.detail();
    if (!current || !this.aiEnabled() || this.startingSpeaking()) {
      return;
    }

    this.startingSpeaking.set(true);
    this.errorMessage.set(null);

    this.pathApi.startUnitSpeaking(current.id, this.i18n.lang()).subscribe({
      next: (res) => {
        this.startingSpeaking.set(false);
        this.speakingSession.set(res.session);
        this.detail.update((d) => (d ? { ...d, progress: res.progress } : null));
      },
      error: (err: unknown) => {
        this.startingSpeaking.set(false);
        this.errorMessage.set(extractApiError(err, 'Unable to start speaking practice.'));
      },
    });
  }

  onSpeakingUpdated(session: AiConversationSessionDetail): void {
    this.speakingSession.set(session);
    const current = this.detail();
    if (current && !current.progress.speakingCompleted && session.turnCount >= 1) {
      this.markSpeakingDone();
    }
  }

  markSpeakingDone(): void {
    const current = this.detail();
    if (!current || this.completingSpeaking()) {
      return;
    }

    this.completingSpeaking.set(true);
    this.pathApi.completeUnitSpeaking(current.id).subscribe({
      next: (res) => {
        this.completingSpeaking.set(false);
        this.detail.update((d) => (d ? { ...d, progress: res.progress } : null));
      },
      error: (err: unknown) => {
        this.completingSpeaking.set(false);
        this.errorMessage.set(extractApiError(err, 'Unable to update speaking progress.'));
      },
    });
  }

  onGuideFocusInput(event: Event): void {
    this.guideFocusGoal.set((event.target as HTMLInputElement).value);
  }

  generateStudyGuide(): void {
    const current = this.detail();
    if (!current || !this.aiEnabled() || this.generatingStudyGuide()) {
      return;
    }

    this.generatingStudyGuide.set(true);
    this.errorMessage.set(null);

    this.pathApi
      .generateUnitStudyGuide(current.id, {
        focusGoal: this.guideFocusGoal().trim() || undefined,
        explanationLang: this.i18n.lang(),
      })
      .subscribe({
        next: (res) => {
          this.generatingStudyGuide.set(false);
          this.showStudyGuide.set(true);
          this.detail.update((d) => (d ? { ...d, studyGuide: res.studyGuide } : null));
        },
        error: (err: unknown) => {
          this.generatingStudyGuide.set(false);
          this.errorMessage.set(extractApiError(err, 'Unable to generate study guide.'));
        },
      });
  }

  regenerateAiUnit(): void {
    const current = this.detail();
    if (!current?.isCustomAiTrack || !this.aiEnabled() || this.regeneratingUnit()) {
      return;
    }

    this.regeneratingUnit.set(true);
    this.errorMessage.set(null);

    this.pathApi
      .regenerateAiUnit(current.id, {
        focusGoal: this.guideFocusGoal().trim() || undefined,
        explanationLang: this.i18n.lang(),
      })
      .subscribe({
        next: (updated) => {
          this.regeneratingUnit.set(false);
          this.showStudyGuide.set(Boolean(updated.studyGuide));
          this.detail.set(updated);
        },
        error: (err: unknown) => {
          this.regeneratingUnit.set(false);
          this.errorMessage.set(extractApiError(err, 'Unable to refresh unit materials.'));
        },
      });
  }
}
