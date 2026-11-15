export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface TopicSummary {
  id: number;
  name: string;
  description: string | null;
  languageId: number;
  vocabularyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopicVocabularyRef {
  id: number;
  term: string;
  pronunciation: string | null;
  partOfSpeech: string | null;
  definition: string;
  example: string | null;
  notes: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopicDetail extends TopicSummary {
  vocabularyItems: TopicVocabularyRef[];
}

export interface VocabularyTopicBadge {
  id: number;
  name: string;
}

export interface VocabularyItem {
  id: number;
  languageId: number;
  term: string;
  pronunciation: string | null;
  partOfSpeech: string | null;
  definition: string;
  example: string | null;
  notes: string | null;
  source: 'manual' | 'quiz' | 'import' | 'ai';
  topics: VocabularyTopicBadge[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVocabularyResult extends VocabularyItem {
  duplicateWarning: boolean;
  existingMatchCount: number;
}

export interface DuplicateCheckResult {
  exists: boolean;
  matches: Array<{ id: number; term: string; definition: string }>;
}

export interface CreateTopicPayload {
  name: string;
  description?: string | null;
}

export interface UpdateTopicPayload {
  name?: string;
  description?: string | null;
}

export interface CreateVocabularyPayload {
  term: string;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
  definition: string;
  example?: string | null;
  notes?: string | null;
  topicIds?: number[];
}

export interface UpdateVocabularyPayload {
  term?: string;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
  definition?: string;
  example?: string | null;
  notes?: string | null;
  topicIds?: number[];
}

export type VocabularyReviewStatusFilter = 'all' | 'new' | 'learning' | 'mastered' | 'due';

export type VocabularySortKey = 'newest' | 'oldest' | 'term_asc' | 'term_desc';

export interface VocabularyQueryParams {
  search?: string;
  topicId?: number | null;
  partOfSpeech?: string;
  reviewStatus?: VocabularyReviewStatusFilter;
  sortBy?: VocabularySortKey;
  page?: number;
  limit?: number;
}
