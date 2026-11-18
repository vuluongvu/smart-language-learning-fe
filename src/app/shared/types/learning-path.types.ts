import { AiConversationSessionDetail, ConversationSuggestedWord } from './ai.types';

export type LearningGoalBand = 'band_45_55' | 'band_55_65' | 'band_65_75';
export type UnitNodeStatus = 'completed' | 'active' | 'locked';

export interface LearningPathTrackSummary {
  id: number;
  code: LearningGoalBand | string;
  title: string;
  cefrLevel: string;
  languageCode: string;
  summary: string;
}

export interface UnitWritingError {
  original: string;
  correction: string;
  reason: string;
}

export interface UnitWritingFeedback {
  estimatedBand: string;
  summary: string;
  usedTargetTerms: string[];
  missedTargetTerms: string[];
  notableErrors: UnitWritingError[];
  upgradedVersion: string;
  explanation: string;
  suggestedWords: ConversationSuggestedWord[];
}

export interface UnitProgressView {
  vocabCompleted: boolean;
  quizCompleted: boolean;
  quizScore: number | null;
  writingCompleted: boolean;
  writingSubmission: string | null;
  writingFeedback: UnitWritingFeedback | null;
  speakingCompleted: boolean;
  speakingSessionId: number | null;
  topicId: number | null;
  skillsDone: number;
  totalSkills: number;
  percentDone: number;
  completedAt: string | null;
}

export interface LearningPathUnitNode {
  id: number;
  unitNumber: number;
  slug: string;
  title: string;
  topicName: string;
  icon: string;
  themeColor: string;
  grammarFocus: string;
  wordCount: number;
  unlocked: boolean;
  status: UnitNodeStatus;
  progress: UnitProgressView;
}

export interface LearningPathPartView {
  id: number;
  partNumber: number;
  title: string;
  subtitle: string;
  units: LearningPathUnitNode[];
}

export interface LearningPathOverview {
  goal: {
    learningGoalBand: LearningGoalBand | string;
    currentLevel: string;
    dailyGoalMinutes: number;
  };
  tracks: LearningPathTrackSummary[];
  activeTrack: LearningPathTrackSummary;
  parts: LearningPathPartView[];
  stats: {
    completedUnits: number;
    totalUnits: number;
    recommendedUnitId: number | null;
  };
}

export interface UnitVocabWord {
  term: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  notes: string;
  inNotebook: boolean;
}

export interface UnitReadingQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UnitReadingListening {
  title: string;
  audioScript: string;
  translation: string;
  questions: UnitReadingQuizQuestion[];
}

export interface UnitWritingPrompt {
  prompt: string;
  minSentences: number;
  targetBand: string;
  targetTerms: string[];
  sampleAnswer: string;
}

export interface LearningPathUnitDetail {
  id: number;
  unitNumber: number;
  slug: string;
  title: string;
  topicName: string;
  icon: string;
  themeColor: string;
  grammarFocus: string;
  track: LearningPathTrackSummary;
  part: {
    id: number;
    partNumber: number;
    title: string;
    subtitle: string;
  };
  vocabulary: UnitVocabWord[];
  readingListening: UnitReadingListening;
  writing: UnitWritingPrompt;
  speakingTopicPrompt: string;
  progress: UnitProgressView;
}

export interface SyncUnitVocabResult {
  topicId: number;
  topicName: string;
  addedCount: number;
  alreadyInNotebookCount: number;
  totalUnitWords: number;
  progress: UnitProgressView;
}

export interface UnitQuizSubmissionResult {
  score: number;
  correctCount: number;
  total: number;
  results: Array<{
    questionId: string;
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation: string;
  }>;
  progress: UnitProgressView;
}

export interface EvaluateUnitWritingResult {
  feedback: UnitWritingFeedback;
  progress: UnitProgressView;
}

export interface StartUnitSpeakingResult {
  session: AiConversationSessionDetail;
  progress: UnitProgressView;
}

export interface SaveUnitWordsResult {
  topicId: number;
  topicName: string;
  addedCount: number;
  skippedCount: number;
}
