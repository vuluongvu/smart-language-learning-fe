import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  OqEmptyStateComponent,
  OqIconComponent,
  OqPageHeaderComponent,
} from '../../shared/components';
import { I18nService, TranslatePipe } from '../../shared/i18n';
import { LearningLanguageService } from '../../shared/services/learning-language.service';
import {
  QuestionType,
  QuizDifficulty,
  QuizQuestionInput,
  QuizStatus,
  TopicSummary,
  VocabularyItem,
} from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { TopicsApiService } from '../topics/topics-api.service';
import { VocabularyApiService } from '../vocabulary/vocabulary-api.service';
import { QuizzesApiService } from './quizzes-api.service';

interface EditableOption {
  localKey: number;
  optionText: string;
  isCorrect: boolean;
}

interface EditableQuestion {
  localKey: number;
  questionType: QuestionType;
  questionText: string;
  explanation: string;
  vocabularyId: number | null;
  vocabularyTerm: string;
  options: EditableOption[];
}

@Component({
  selector: 'app-quiz-builder',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    OqPageHeaderComponent,
    OqEmptyStateComponent,
    OqIconComponent,
    TranslatePipe,
  ],
  templateUrl: './quiz-builder.component.html',
  styleUrl: './quiz-builder.component.scss',
})
export class QuizBuilderComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quizzesApi = inject(QuizzesApiService);
  private readonly topicsApi = inject(TopicsApiService);
  private readonly vocabularyApi = inject(VocabularyApiService);
  private readonly i18n = inject(I18nService);
  protected readonly learningLang = inject(LearningLanguageService);

  private nextKey = 1;

  protected readonly editingQuizId = signal<number | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isGenerating = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly topics = signal<TopicSummary[]>([]);
  protected readonly vocabularyItems = signal<VocabularyItem[]>([]);
  protected readonly questions = signal<EditableQuestion[]>([]);

  protected readonly showGenerator = signal(false);
  protected genTopicId: number | null = null;
  protected genCount = 5;
  protected genIncludeMcq = true;
  protected genIncludeWordMeaning = true;
  protected genIncludeFillBlank = true;

  protected readonly metaForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    description: ['', [Validators.maxLength(5000)]],
    topicId: [null as number | null],
    difficulty: ['' as QuizDifficulty | ''],
  });

  ngOnInit(): void {
    const activeLang = this.learningLang.activeLang();
    this.topicsApi.list({ limit: 100, languageCode: activeLang }).subscribe({
      next: (res) => this.topics.set(res.items),
      error: () => undefined,
    });
    this.vocabularyApi.list({ limit: 100, languageCode: activeLang }).subscribe({
      next: (res) => this.vocabularyItems.set(res.items),
      error: () => undefined,
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (id && id > 0) {
      this.editingQuizId.set(id);
      this.loadExistingQuiz(id);
    } else {
      const qpTopic = Number(this.route.snapshot.queryParamMap.get('topicId'));
      if (qpTopic > 0) {
        this.metaForm.patchValue({ topicId: qpTopic });
        this.genTopicId = qpTopic;
      }
      this.addQuestion('multiple_choice');
    }
  }

  private loadExistingQuiz(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.quizzesApi.getOne(id).subscribe({
      next: (quiz) => {
        this.metaForm.reset({
          title: quiz.title,
          description: quiz.description ?? '',
          topicId: quiz.topicId,
          difficulty: quiz.difficulty ?? '',
        });
        this.questions.set(
          quiz.questions.map((q) => ({
            localKey: this.nextKey++,
            questionType: q.questionType,
            questionText: q.questionText,
            explanation: q.explanation ?? '',
            vocabularyId: q.vocabularyId,
            vocabularyTerm: q.vocabularyTerm ?? '',
            options: q.options.map((o) => ({
              localKey: this.nextKey++,
              optionText: o.optionText,
              isCorrect: o.isCorrect,
            })),
          })),
        );
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi' ? 'Không thể tải bài kiểm tra' : 'Failed to load quiz',
          ),
        );
        this.isLoading.set(false);
      },
    });
  }

  addQuestion(type: QuestionType): void {
    const defaultOptions: EditableOption[] =
      type === 'fill_blank'
        ? [{ localKey: this.nextKey++, optionText: '', isCorrect: true }]
        : [
            { localKey: this.nextKey++, optionText: '', isCorrect: true },
            { localKey: this.nextKey++, optionText: '', isCorrect: false },
            { localKey: this.nextKey++, optionText: '', isCorrect: false },
            { localKey: this.nextKey++, optionText: '', isCorrect: false },
          ];

    this.questions.update((list) => [
      ...list,
      {
        localKey: this.nextKey++,
        questionType: type,
        questionText: '',
        explanation: '',
        vocabularyId: null,
        vocabularyTerm: '',
        options: defaultOptions,
      },
    ]);
  }

  removeQuestion(index: number): void {
    this.questions.update((list) => list.filter((_, i) => i !== index));
  }

  moveQuestion(index: number, delta: -1 | 1): void {
    const target = index + delta;
    const list = this.questions();
    if (target < 0 || target >= list.length) return;

    const copy = [...list];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    this.questions.set(copy);
  }

  onQuestionTypeChange(qIndex: number, nextType: QuestionType): void {
    this.questions.update((list) =>
      list.map((q, idx) => {
        if (idx !== qIndex) return q;
        if (nextType === 'fill_blank') {
          const correctOpt = q.options.find((o) => o.isCorrect) ?? q.options[0];
          return {
            ...q,
            questionType: nextType,
            options: [
              {
                localKey: correctOpt?.localKey ?? this.nextKey++,
                optionText: correctOpt?.optionText ?? '',
                isCorrect: true,
              },
            ],
          };
        }

        const existingOpts =
          q.options.length >= 2
            ? q.options
            : [
                ...q.options.map((o, i) => ({ ...o, isCorrect: i === 0 })),
                {
                  localKey: this.nextKey++,
                  optionText: '',
                  isCorrect: q.options.length === 0,
                },
                { localKey: this.nextKey++, optionText: '', isCorrect: false },
              ];
        const hasCorrect = existingOpts.some((o) => o.isCorrect);
        return {
          ...q,
          questionType: nextType,
          options: existingOpts.map((o, i) => ({
            ...o,
            isCorrect: hasCorrect ? o.isCorrect : i === 0,
          })),
        };
      }),
    );
  }

  onVocabularySelect(qIndex: number, vocabId: number | null): void {
    const matched = vocabId ? this.vocabularyItems().find((v) => v.id === vocabId) : undefined;

    this.questions.update((list) =>
      list.map((q, idx) =>
        idx === qIndex
          ? {
              ...q,
              vocabularyId: vocabId,
              vocabularyTerm: matched ? matched.term : q.vocabularyTerm,
            }
          : q,
      ),
    );
  }

  addOption(qIndex: number): void {
    this.questions.update((list) =>
      list.map((q, idx) => {
        if (idx !== qIndex) return q;
        const limit = q.questionType === 'fill_blank' ? 5 : 6;
        if (q.options.length >= limit) return q;
        return {
          ...q,
          options: [
            ...q.options,
            {
              localKey: this.nextKey++,
              optionText: '',
              isCorrect: q.questionType === 'fill_blank',
            },
          ],
        };
      }),
    );
  }

  removeOption(qIndex: number, oIndex: number): void {
    this.questions.update((list) =>
      list.map((q, idx) => {
        if (idx !== qIndex) return q;
        const min = q.questionType === 'fill_blank' ? 1 : 2;
        if (q.options.length <= min) return q;

        const nextOpts = q.options.filter((_, i) => i !== oIndex);
        if (
          q.questionType !== 'fill_blank' &&
          !nextOpts.some((o) => o.isCorrect) &&
          nextOpts.length > 0
        ) {
          nextOpts[0] = { ...nextOpts[0], isCorrect: true };
        }
        return { ...q, options: nextOpts };
      }),
    );
  }

  setCorrectOption(qIndex: number, oIndex: number): void {
    this.questions.update((list) =>
      list.map((q, idx) =>
        idx === qIndex
          ? {
              ...q,
              options: q.options.map((opt, i) => ({
                ...opt,
                isCorrect: q.questionType === 'fill_blank' || i === oIndex,
              })),
            }
          : q,
      ),
    );
  }

  generateDraftQuestions(): void {
    const questionTypes: QuestionType[] = [];
    if (this.genIncludeMcq) questionTypes.push('multiple_choice');
    if (this.genIncludeWordMeaning) questionTypes.push('word_meaning');
    if (this.genIncludeFillBlank) questionTypes.push('fill_blank');

    if (questionTypes.length === 0) {
      this.errorMessage.set(
        this.i18n.lang() === 'vi'
          ? 'Chọn ít nhất một loại câu hỏi để tạo câu hỏi nháp.'
          : 'Select at least one question type to generate draft questions.',
      );
      return;
    }

    this.isGenerating.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.quizzesApi
      .draftFromVocabulary({
        topicId: this.genTopicId,
        languageCode: this.learningLang.activeLang(),
        count: Math.min(20, Math.max(1, Number(this.genCount) || 5)),
        questionTypes,
      })
      .subscribe({
        next: (res) => {
          this.isGenerating.set(false);
          const mapped: EditableQuestion[] = res.questions.map((q) => ({
            localKey: this.nextKey++,
            questionType: q.questionType,
            questionText: q.questionText,
            explanation: q.explanation ?? '',
            vocabularyId: q.vocabularyId ?? null,
            vocabularyTerm: q.vocabularyTerm ?? '',
            options: q.options.map((o) => ({
              localKey: this.nextKey++,
              optionText: o.optionText,
              isCorrect: o.isCorrect,
            })),
          }));

          this.questions.update((existing) => {
            const hasOnlyBlankStarter =
              existing.length === 1 &&
              !existing[0].questionText.trim() &&
              existing[0].options.every((o) => !o.optionText.trim());
            return hasOnlyBlankStarter ? mapped : [...existing, ...mapped];
          });

          if (!this.metaForm.controls.topicId.value && this.genTopicId) {
            this.metaForm.patchValue({ topicId: this.genTopicId });
          }

          this.successMessage.set(
            this.i18n.lang() === 'vi'
              ? `Đã thêm ${mapped.length} câu hỏi nháp từ kho từ vựng. Hãy rà soát hoặc chỉnh sửa trước khi lưu.`
              : `Added ${mapped.length} draft question(s) from your vocabulary bank. Review or edit before saving.`,
          );
          this.showGenerator.set(false);
        },
        error: (err: unknown) => {
          this.isGenerating.set(false);
          this.errorMessage.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi'
                ? 'Không thể tạo câu hỏi nháp'
                : 'Failed to generate draft questions',
            ),
          );
        },
      });
  }

  saveQuiz(targetStatus: QuizStatus): void {
    if (this.metaForm.invalid) {
      this.metaForm.markAllAsTouched();
      return;
    }

    const rawMeta = this.metaForm.getRawValue();
    const title = rawMeta.title.trim();
    if (!title) {
      this.errorMessage.set(
        this.i18n.lang() === 'vi'
          ? 'Tiêu đề bài kiểm tra không được để trống.'
          : 'Quiz title cannot be empty.',
      );
      return;
    }

    const qs = this.questions();
    if (targetStatus === 'published' && qs.length === 0) {
      this.errorMessage.set(
        this.i18n.lang() === 'vi'
          ? 'Hãy thêm ít nhất 1 câu hỏi trước khi xuất bản bài kiểm tra này.'
          : 'Add at least 1 question before publishing this quiz.',
      );
      return;
    }

    const validationErr = this.validateQuestions(qs);
    if (validationErr) {
      this.errorMessage.set(validationErr);
      return;
    }

    const payloadQuestions: QuizQuestionInput[] = qs.map((q) => ({
      vocabularyId: q.vocabularyId,
      vocabularyTerm: q.vocabularyTerm.trim() || null,
      questionText: q.questionText.trim(),
      questionType: q.questionType,
      explanation: q.explanation.trim() || null,
      options: q.options.map((opt) => ({
        optionText: opt.optionText.trim(),
        isCorrect: q.questionType === 'fill_blank' ? true : opt.isCorrect,
      })),
    }));

    const payload = {
      title,
      description: rawMeta.description.trim() || null,
      topicId: rawMeta.topicId,
      difficulty: rawMeta.difficulty ? rawMeta.difficulty : null,
      status: targetStatus,
      questions: payloadQuestions,
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const editId = this.editingQuizId();
    const req$ = editId
      ? this.quizzesApi.update(editId, payload)
      : this.quizzesApi.create({ ...payload, languageCode: this.learningLang.activeLang() });

    req$.subscribe({
      next: () => {
        this.isSaving.set(false);
        void this.router.navigate(['/quizzes']);
      },
      error: (err: unknown) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi' ? 'Không thể lưu bài kiểm tra' : 'Failed to save quiz',
          ),
        );
      },
    });
  }

  private validateQuestions(qs: EditableQuestion[]): string | null {
    const isVi = this.i18n.lang() === 'vi';
    for (let i = 0; i < qs.length; i += 1) {
      const q = qs[i];
      const num = i + 1;
      if (!q.questionText.trim()) {
        return isVi
          ? `Câu hỏi #${num}: nội dung câu hỏi không được để trống.`
          : `Question #${num}: prompt cannot be empty.`;
      }
      if (q.options.some((o) => !o.optionText.trim())) {
        return isVi
          ? `Câu hỏi #${num}: tất cả phương án / đáp án phải có nội dung.`
          : `Question #${num}: all options / answers must have text.`;
      }
      if (q.questionType === 'fill_blank') {
        if (q.options.length === 0) {
          return isVi
            ? `Câu hỏi #${num}: cần ít nhất 1 đáp án được chấp nhận.`
            : `Question #${num}: add at least 1 accepted answer.`;
        }
      } else {
        if (q.options.length < 2) {
          return isVi
            ? `Câu hỏi #${num}: cần ít nhất 2 phương án.`
            : `Question #${num}: add at least 2 options.`;
        }
        const correctCount = q.options.filter((o) => o.isCorrect).length;
        if (correctCount !== 1) {
          return isVi
            ? `Câu hỏi #${num}: chọn đúng 1 đáp án chính xác.`
            : `Question #${num}: select exactly 1 correct answer.`;
        }
      }
    }
    return null;
  }

  questionTypeLabel(type: QuestionType): string {
    switch (type) {
      case 'multiple_choice':
        return this.i18n.t('qb.typeMcq');
      case 'word_meaning':
        return this.i18n.t('qb.typeMeaning');
      case 'fill_blank':
        return this.i18n.t('qb.typeBlank');
    }
  }
}
