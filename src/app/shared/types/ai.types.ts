import type { LearningLanguageCode } from './learning-language.types';
import { CefrLevel } from './learning.types';

export type AiChatRole = 'user' | 'assistant';

export interface AiHistoryMessage {
  role: AiChatRole;
  content: string;
}

export interface AiStatus {
  enabled: boolean;
  model: string;
}

export interface AiChatRequest {
  message: string;
  history?: AiHistoryMessage[];
  temperature?: number;
  languageCode?: LearningLanguageCode;
}

export interface AiTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AiChatResponse {
  model: string;
  content: string;
  usage?: AiTokenUsage;
}

export type ConversationLevel = CefrLevel;
export type ExplanationLanguage = 'vi' | 'en';
export type ConversationSessionStatus = 'active' | 'completed';
export type ErrorCategory = 'grammar' | 'vocabulary' | 'phrasing' | 'tone';
export type AppropriatenessRating = 'great' | 'good' | 'needs_work';

export interface ConversationFeedbackError {
  original: string;
  correction: string;
  category: ErrorCategory;
  reason: string;
}

export interface ConversationSuggestedWord {
  term: string;
  partOfSpeech: string | null;
  definition: string;
  example: string | null;
}

export interface ConversationTurnFeedback {
  appropriateness: AppropriatenessRating;
  assessment: string;
  notableErrors: ConversationFeedbackError[];
  improvedVersion: string;
  explanation: string;
  suggestedWords: ConversationSuggestedWord[];
}

export interface ConversationCommonMistake {
  pattern: string;
  example: string;
  suggestion: string;
}

export interface ConversationSummary {
  overallRemark: string;
  commonMistakes: ConversationCommonMistake[];
  newVocabulary: ConversationSuggestedWord[];
  improvementTips: string[];
}

export interface AiConversationTurn {
  id: number;
  turnNumber: number;
  aiPrompt: string;
  userAnswer: string | null;
  feedback: ConversationTurnFeedback | null;
  answeredAt: string | null;
  createdAt: string;
}

export interface AiConversationSessionSummary {
  id: number;
  topic: string;
  level: ConversationLevel;
  explanationLang: ExplanationLanguage;
  languageCode?: LearningLanguageCode;
  status: ConversationSessionStatus;
  turnCount: number;
  summary: ConversationSummary | null;
  createdAt: string;
  updatedAt: string;
  endedAt: string | null;
}

export interface AiConversationSessionDetail extends AiConversationSessionSummary {
  turns: AiConversationTurn[];
}

export interface StartConversationRequest {
  topic: string;
  level?: ConversationLevel;
  explanationLang?: ExplanationLanguage;
  languageCode?: LearningLanguageCode;
}

export type ConversationInputMode = 'text' | 'voice';

export interface ReplyConversationRequest {
  answer: string;
  inputMode?: ConversationInputMode;
}

export interface AiTranscribeResponse {
  model: string;
  text: string;
}

export type HandwritingRecognitionMode = 'recognize' | 'evaluate';

export interface RecognizeHandwritingResult {
  model: string;
  recognizedText: string;
  candidates: string[];
  isMatch: boolean | null;
  feedback: string | null;
  usage?: AiTokenUsage;
}

export type StarterGrammarCategory = 'order' | 'particles' | 'verbs';
export type StarterGrammarLevel = 'A0' | 'A1' | 'A2';
export type StarterGrammarExerciseKind = 'choice' | 'scramble';

export interface StarterGrammarExample {
  sentence: string;
  reading?: string;
  meaningVi: string;
  meaningEn: string;
}

export interface StarterGrammarRulePart {
  labelVi: string;
  labelEn: string;
  sample: string;
}

export interface StarterGrammarPoint {
  id: string;
  category: StarterGrammarCategory;
  titleVi: string;
  titleEn: string;
  formula: string;
  explanationVi: string;
  explanationEn: string;
  rules: StarterGrammarRulePart[];
  examples: StarterGrammarExample[];
  mistake: string;
  correction: string;
  mistakeNoteVi: string;
  mistakeNoteEn: string;
  aiPromptVi: string;
  aiPromptEn: string;
  isAiGenerated?: boolean;
  level?: StarterGrammarLevel;
}

export interface StarterGrammarQuestion {
  id: string;
  grammarId: string;
  kind: StarterGrammarExerciseKind;
  promptVi: string;
  promptEn: string;
  stem: string;
  correctOption: string;
  options: string[];
  scrambleWords?: string[];
  completedSentence: string;
  explanationVi: string;
  explanationEn: string;
  isAiGenerated?: boolean;
}

export interface GenerateStarterGrammarRequest {
  topic: string;
  level?: StarterGrammarLevel;
  languageCode?: LearningLanguageCode;
  explanationLanguage?: ExplanationLanguage;
  exerciseCount?: number;
}

export interface GenerateStarterGrammarResponse {
  model: string;
  grammarPoint: StarterGrammarPoint;
  exercises: StarterGrammarQuestion[];
  usage?: AiTokenUsage;
}
