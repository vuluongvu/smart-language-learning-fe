import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  OqEmptyStateComponent,
  OqIconComponent,
  OqPageHeaderComponent,
} from '../../shared/components';
import { I18nService, TranslatePipe } from '../../shared/i18n';
import { TopicDetail, VocabularyItem } from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { VocabularyApiService } from '../vocabulary/vocabulary-api.service';
import { TopicsApiService } from './topics-api.service';

@Component({
  selector: 'app-topic-detail',
  imports: [
    FormsModule,
    RouterLink,
    OqPageHeaderComponent,
    OqEmptyStateComponent,
    OqIconComponent,
    TranslatePipe,
  ],
  templateUrl: './topic-detail.component.html',
  styleUrl: './topic-detail.component.scss',
})
export class TopicDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly topicsApi = inject(TopicsApiService);
  private readonly vocabularyApi = inject(VocabularyApiService);
  private readonly i18n = inject(I18nService);

  protected readonly topic = signal<TopicDetail | null>(null);
  protected readonly allVocabulary = signal<VocabularyItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly statusMessage = signal<string | null>(null);

  protected selectedVocabularyId: number | null = null;
  protected readonly isAttaching = signal(false);

  protected readonly attachableVocabulary = computed(() => {
    const currentTopic = this.topic();
    if (!currentTopic) return [];
    const attachedIds = new Set(currentTopic.vocabularyItems.map((v) => v.id));
    return this.allVocabulary().filter((item) => !attachedIds.has(item.id));
  });

  ngOnInit(): void {
    this.loadDetail();
  }

  loadDetail(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage.set(
        this.i18n.lang() === 'vi' ? 'ID chủ đề không hợp lệ' : 'Invalid topic ID',
      );
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.topicsApi.getOne(id).subscribe({
      next: (detail) => {
        this.topic.set(detail);
        this.isLoading.set(false);
        this.loadAvailableVocabulary();
      },
      error: (err: unknown) => {
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi' ? 'Không thể tải chủ đề' : 'Failed to load topic',
          ),
        );
        this.isLoading.set(false);
      },
    });
  }

  attachSelected(): void {
    const currentTopic = this.topic();
    if (!currentTopic || !this.selectedVocabularyId) return;

    this.isAttaching.set(true);
    this.errorMessage.set(null);
    this.statusMessage.set(null);

    this.topicsApi.attachVocabulary(currentTopic.id, Number(this.selectedVocabularyId)).subscribe({
      next: () => {
        this.isAttaching.set(false);
        this.selectedVocabularyId = null;
        this.statusMessage.set(this.i18n.t('topicDetail.attachedMsg'));
        this.loadDetail();
      },
      error: (err: unknown) => {
        this.isAttaching.set(false);
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi' ? 'Không thể thêm từ vào chủ đề' : 'Failed to attach item',
          ),
        );
      },
    });
  }

  detachItem(vocabularyId: number, term: string): void {
    const currentTopic = this.topic();
    if (!currentTopic) return;

    this.errorMessage.set(null);
    this.statusMessage.set(null);

    this.topicsApi.detachVocabulary(currentTopic.id, vocabularyId).subscribe({
      next: () => {
        this.statusMessage.set(this.i18n.t('topicDetail.detachedMsg', { term }));
        this.loadDetail();
      },
      error: (err: unknown) => {
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi' ? 'Không thể gỡ từ khỏi chủ đề' : 'Failed to remove item',
          ),
        );
      },
    });
  }

  private loadAvailableVocabulary(): void {
    this.vocabularyApi.list({ limit: 100 }).subscribe({
      next: (res) => this.allVocabulary.set(res.items),
      error: () => undefined,
    });
  }
}
