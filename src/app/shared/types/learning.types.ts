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

export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export type QuizStatus = 'draft' | 'published';
export type QuestionType = 'multiple_choice' | 'fill_blank' | 'word_meaning';
export type QuizAttemptStatus = 'in_progress' | 'completed';
export type QuizSortKey = 'newest' | 'oldest' | 'title_asc' | 'title_desc';

export interface QuizSummary {
  id: number;
  title: string;
  description: string | null;
  topicId: number | null;
  topicName: string | null;
  difficulty: QuizDifficulty | null;
  status: QuizStatus;
  questionCount: number;
  attemptCount: number;
  inProgressAttemptId: number | null;
  lastScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuizOptionInput {
  optionText: string;
  isCorrect: boolean;
}

export interface QuizQuestionInput {
  vocabularyId?: number | null;
  vocabularyTerm?: string | null;
  questionText: string;
  questionType: QuestionType;
  explanation?: string | null;
  options: QuizOptionInput[];
}

export interface QuizOptionEditor {
  id: number;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuizQuestionEditor {
  id: number;
  vocabularyId: number | null;
  vocabularyTerm: string | null;
  questionText: string;
  questionType: QuestionType;
  explanation: string | null;
  orderIndex: number;
  options: QuizOptionEditor[];
}

export interface QuizDetail {
  id: number;
  title: string;
  description: string | null;
  topicId: number | null;
  topicName: string | null;
  difficulty: QuizDifficulty | null;
  status: QuizStatus;
  questions: QuizQuestionEditor[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizPayload {
  title: string;
  description?: string | null;
  topicId?: number | null;
  difficulty?: QuizDifficulty | null;
  status?: QuizStatus;
  questions?: QuizQuestionInput[];
}

export interface UpdateQuizPayload {
  title?: string;
  description?: string | null;
  topicId?: number | null;
  difficulty?: QuizDifficulty | null;
  status?: QuizStatus;
  questions?: QuizQuestionInput[];
}

export interface QuizQueryParams {
  search?: string;
  topicId?: number | null;
  status?: QuizStatus | '';
  difficulty?: QuizDifficulty | '';
  sortBy?: QuizSortKey;
  page?: number;
  limit?: number;
}

export interface DraftFromVocabularyPayload {
  topicId?: number | null;
  vocabularyIds?: number[];
  count?: number;
  questionTypes?: QuestionType[];
}

export interface AttemptTakingOption {
  id: number;
  optionText: string;
  orderIndex: number;
}

export interface AttemptTakingQuestion {
  id: number;
  questionText: string;
  questionType: QuestionType;
  orderIndex: number;
  options: AttemptTakingOption[];
  savedSelectedOptionId: number | null;
  savedAnswerText: string | null;
}

export interface AttemptCompletedAnswer {
  id: number;
  questionId: number | null;
  questionText: string;
  questionType: QuestionType;
  selectedOptionId: number | null;
  answerText: string | null;
  correctAnswer: string;
  explanation: string | null;
  vocabularyId: number | null;
  vocabularyTerm: string | null;
  isCorrect: boolean;
  answeredAt: string;
}

export interface AttemptDetail {
  id: number;
  quizId: number;
  quizTitle: string;
  status: QuizAttemptStatus;
  score: number;
  correctCount: number;
  totalQuestions: number;
  startedAt: string;
  completedAt: string | null;
  questions: AttemptTakingQuestion[];
  answers: AttemptCompletedAnswer[];
}

export interface AttemptSummary {
  id: number;
  quizId: number;
  quizTitle: string;
  status: QuizAttemptStatus;
  score: number;
  correctCount: number;
  totalQuestions: number;
  startedAt: string;
  completedAt: string | null;
}

export interface AttemptAnswerSubmission {
  questionId: number;
  selectedOptionId?: number | null;
  answerText?: string | null;
}

export interface SaveVocabularyFromQuizPayload {
  existingVocabularyId?: number | null;
  term?: string;
  definition?: string;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
  example?: string | null;
  notes?: string | null;
  topicIds?: number[];
  newTopicName?: string | null;
  newTopicDescription?: string | null;
}

export interface SaveVocabularyFromQuizResult {
  item: VocabularyItem;
  createdNewItem: boolean;
  createdTopicId: number | null;
}
