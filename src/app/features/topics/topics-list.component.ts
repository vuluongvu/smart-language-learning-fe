import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  OqEmptyStateComponent,
  OqIconComponent,
  OqModalComponent,
  OqPageHeaderComponent,
} from '../../shared/components';
import { PaginationMeta, TopicSummary } from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { TopicsApiService } from './topics-api.service';

@Component({
  selector: 'app-topics-list',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    OqPageHeaderComponent,
    OqModalComponent,
    OqEmptyStateComponent,
    OqIconComponent,
  ],
  templateUrl: './topics-list.component.html',
  styleUrl: './topics-list.component.scss',
})
export class TopicsListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly topicsApi = inject(TopicsApiService);

  protected readonly topics = signal<TopicSummary[]>([]);
  protected readonly meta = signal<PaginationMeta>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected searchTerm = '';
  protected readonly showForm = signal(false);
  protected readonly editingTopic = signal<TopicSummary | null>(null);
  protected readonly isSaving = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly confirmDeleteTopic = signal<TopicSummary | null>(null);
  protected readonly isDeleting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    this.loadTopics(1);
  }

  loadTopics(page = 1): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.topicsApi.list({ search: this.searchTerm, page, limit: 12 }).subscribe({
      next: (res) => {
        this.topics.set(res.items);
        this.meta.set(res.meta);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.errorMessage.set(extractApiError(err, 'Failed to load topics'));
        this.isLoading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingTopic.set(null);
    this.formError.set(null);
    this.form.reset({ name: '', description: '' });
    this.showForm.set(true);
  }

  openEdit(topic: TopicSummary): void {
    this.editingTopic.set(topic);
    this.formError.set(null);
    this.form.reset({
      name: topic.name,
      description: topic.description ?? '',
    });
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingTopic.set(null);
    this.formError.set(null);
  }

  saveTopic(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const name = raw.name.trim();
    if (!name) {
      this.formError.set('Topic name cannot be empty.');
      return;
    }

    this.isSaving.set(true);
    this.formError.set(null);
    this.successMessage.set(null);

    const editing = this.editingTopic();
    const request$ = editing
      ? this.topicsApi.update(editing.id, {
          name,
          description: raw.description.trim() || null,
        })
      : this.topicsApi.create({
          name,
          description: raw.description.trim() || null,
        });

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showForm.set(false);
        this.editingTopic.set(null);
        this.successMessage.set(
          editing ? 'Topic updated successfully.' : 'Topic created successfully.',
        );
        this.loadTopics(editing ? this.meta().page : 1);
      },
      error: (err: unknown) => {
        this.isSaving.set(false);
        this.formError.set(extractApiError(err, 'Failed to save topic'));
      },
    });
  }

  deleteSelectedTopic(): void {
    const target = this.confirmDeleteTopic();
    if (!target) return;

    this.isDeleting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.topicsApi.remove(target.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.confirmDeleteTopic.set(null);
        this.successMessage.set(
          `Deleted topic "${target.name}". Shared vocabulary items were preserved.`,
        );
        this.loadTopics(this.meta().page);
      },
      error: (err: unknown) => {
        this.isDeleting.set(false);
        this.errorMessage.set(extractApiError(err, 'Failed to delete topic'));
      },
    });
  }
}
