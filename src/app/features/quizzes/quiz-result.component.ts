import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  OqEmptyStateComponent,
  OqIconComponent,
  OqPageHeaderComponent,
  OqProgressBarComponent,
} from '../../shared/components';
import { I18nService, TranslatePipe } from '../../shared/i18n';
import { OqMarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { LearningLanguageService } from '../../shared/services/learning-language.service';
import { containsHangul } from '../../shared/types/learning-language.types';
import {
  AttemptCompletedAnswer,
  AttemptDetail,
  DuplicateCheckResult,
  TopicSummary,
} from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { TopicsApiService } from '../topics/topics-api.service';
import { VocabularyApiService } from '../vocabulary/vocabulary-api.service';
import { QuizzesApiService } from './quizzes-api.service';

@Component({
  selector: 'app-quiz-result',
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OqPageHeaderComponent,
    OqProgressBarComponent,
    OqEmptyStateComponent,
    OqIconComponent,
    TranslatePipe,
    OqMarkdownPipe,
  ],
  templateUrl: './quiz-result.component.html',
  styleUrl: './quiz-result.component.scss',
})
export class QuizResultComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly quizzesApi = inject(QuizzesApiService);
  private readonly topicsApi = inject(TopicsApiService);
  private readonly vocabularyApi = inject(VocabularyApiService);
  private readonly i18n = inject(I18nService);
  protected readonly learningLang = inject(LearningLanguageService);

  protected readonly attempt = signal<AttemptDetail | null>(null);
  protected readonly topics = signal<TopicSummary[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly activeAnswerId = signal<number | null>(null);
  protected saveTerm = '';
  protected saveDefinition = '';
  protected savePronunciation = '';
  protected savePartOfSpeech = '';
  protected saveExample = '';
  protected saveNotes = '';
  protected newTopicName = '';
  protected readonly selectedTopicIds = signal<number[]>([]);
  protected readonly duplicateCheck = signal<DuplicateCheckResult | null>(null);
  protected readonly isSavingVocab = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly savedMessages = signal<Record<number, string>>({});

  ngOnInit(): void {
    const attemptId = Number(this.route.snapshot.paramMap.get('attemptId'));
    if (!attemptId || attemptId <= 0) {
      this.errorMessage.set(
        this.i18n.lang() === 'vi' ? 'ID lượt làm bài không hợp lệ.' : 'Invalid attempt ID.',
      );
      this.isLoading.set(false);
      return;
    }

    this.loadTopics();
    this.quizzesApi.getAttempt(attemptId).subscribe({
      next: (data) => {
        this.attempt.set(data);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể tải kết quả bài kiểm tra'
              : 'Failed to load quiz result',
          ),
        );
        this.isLoading.set(false);
      },
    });
  }

  private loadTopics(): void {
    this.topicsApi.list({ limit: 100, languageCode: this.learningLang.activeLang() }).subscribe({
      next: (res) => this.topics.set(res.items),
      error: () => undefined,
    });
  }

  openSaveVocab(ans: AttemptCompletedAnswer): void {
    this.activeAnswerId.set(ans.id);
    this.saveError.set(null);
    this.duplicateCheck.set(null);
    this.selectedTopicIds.set([]);
    this.newTopicName = '';

    const suggestedTerm =
      ans.vocabularyTerm ?? (ans.questionType !== 'word_meaning' ? ans.correctAnswer : '');
    const suggestedDef =
      ans.questionType === 'word_meaning' ? ans.correctAnswer : (ans.explanation ?? '');

    this.saveTerm = suggestedTerm;
    this.saveDefinition = suggestedDef;
    this.savePronunciation = '';
    this.savePartOfSpeech = '';
    this.saveExample = '';
    this.saveNotes = '';

    if (suggestedTerm.trim()) {
      this.checkDuplicateTerm();
    }
  }

  closeSaveVocab(): void {
    this.activeAnswerId.set(null);
    this.saveError.set(null);
    this.duplicateCheck.set(null);
  }

  toggleTopic(topicId: number): void {
    this.selectedTopicIds.update((ids) =>
      ids.includes(topicId) ? ids.filter((id) => id !== topicId) : [...ids, topicId],
    );
  }

  checkDuplicateTerm(): void {
    const term = this.saveTerm.trim();
    if (!term) {
      this.duplicateCheck.set(null);
      return;
    }

    const langCode = containsHangul(term) ? 'ko' : this.learningLang.activeLang();
    this.vocabularyApi.checkDuplicate(term, langCode).subscribe({
      next: (res) => this.duplicateCheck.set(res.exists ? res : null),
      error: () => undefined,
    });
  }

  attachExistingItem(existingVocabularyId: number, answerId: number): void {
    const topicIds = this.selectedTopicIds();
    const newTopic = this.newTopicName.trim();
    if (topicIds.length === 0 && !newTopic) {
      this.saveError.set(
        this.i18n.lang() === 'vi'
          ? 'Chọn ít nhất một chủ đề hoặc nhập tên chủ đề mới để gắn từ có sẵn.'
          : 'Select at least one Topic or enter a new Topic name to attach the existing item.',
      );
      return;
    }

    this.isSavingVocab.set(true);
    this.saveError.set(null);

    this.quizzesApi
      .saveVocabularyFromQuiz({
        existingVocabularyId,
        topicIds,
        newTopicName: newTopic || null,
      })
      .subscribe({
        next: (res) => {
          this.isSavingVocab.set(false);
          this.activeAnswerId.set(null);
          this.savedMessages.update((prev) => ({
            ...prev,
            [answerId]:
              this.i18n.lang() === 'vi'
                ? `Đã gắn từ có sẵn "${res.item.term}" vào chủ đề đã chọn.`
                : `Attached existing item "${res.item.term}" to selected topic(s).`,
          }));
          if (res.createdTopicId) {
            this.loadTopics();
          }
        },
        error: (err: unknown) => {
          this.isSavingVocab.set(false);
          this.saveError.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi'
                ? 'Không thể gắn từ có sẵn'
                : 'Failed to attach existing vocabulary',
            ),
          );
        },
      });
  }

  saveNewVocabItem(answerId: number): void {
    const term = this.saveTerm.trim();
    const definition = this.saveDefinition.trim();
    if (!term || !definition) {
      this.saveError.set(
        this.i18n.lang() === 'vi'
          ? 'Cần nhập cả từ vựng và định nghĩa.'
          : 'Term and definition are required.',
      );
      return;
    }

    this.isSavingVocab.set(true);
    this.saveError.set(null);

    const langCode = containsHangul(term) ? 'ko' : this.learningLang.activeLang();
    this.quizzesApi
      .saveVocabularyFromQuiz({
        term,
        definition,
        languageCode: langCode,
        pronunciation: this.savePronunciation.trim() || null,
        partOfSpeech: this.savePartOfSpeech.trim() || null,
        example: this.saveExample.trim() || null,
        notes: this.saveNotes.trim() || null,
        topicIds: this.selectedTopicIds(),
        newTopicName: this.newTopicName.trim() || null,
      })
      .subscribe({
        next: (res) => {
          this.isSavingVocab.set(false);
          this.activeAnswerId.set(null);
          this.savedMessages.update((prev) => ({
            ...prev,
            [answerId]:
              this.i18n.lang() === 'vi'
                ? `Đã lưu "${res.item.term}" vào Kho từ vựng.`
                : `Saved "${res.item.term}" to your Vocabulary Bank.`,
          }));
          if (res.createdTopicId) {
            this.loadTopics();
          }
        },
        error: (err: unknown) => {
          this.isSavingVocab.set(false);
          this.saveError.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi'
                ? 'Không thể lưu mục từ vựng'
                : 'Failed to save vocabulary item',
            ),
          );
        },
      });
  }
}
