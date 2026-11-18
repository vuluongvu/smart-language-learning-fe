import { Pipe, PipeTransform, inject } from '@angular/core';
import { AppLocale, I18nService } from '../../shared/i18n';

export const LP_EN_TRANSLATIONS = {
  'lp.langEnglish': 'English',
  'lp.selectBandLabel': 'Choose target Band track',
  'lp.courseGoalBtn': 'Course goal',
  'lp.goalSummaryMeta': 'Current: {{level}} · {{minutes}} min/day',
  'lp.unitsProgress': '{{done}} / {{total}} units finished',
  'lp.continueUnitBtn': 'Continue learning',
  'lp.emptyTitle': 'No learning units yet',
  'lp.emptyDesc': 'Select a target Band above to view its curriculum.',
  'lp.vocabNotebookNode': 'Vocab Notebook',
  'lp.unitCompleted': 'Completed 4/4 skills',
  'lp.unitLockedHint': 'Preview available · Finish 2 skills prior to unlock',
  'lp.skillsDoneMeta': '{{done}}/{{total}} skills done',
  'lp.goalModalTitle': 'Course Learning Goal',
  'lp.goalModalSubtitle':
    'Argon Learning tailors AI Writing & Speaking feedback to match your target Band.',
  'lp.goalBandLabel': 'Target Band track',
  'lp.currentLevelLabel': 'Your current CEFR level',
  'lp.dailyMinutesLabel': 'Daily study target',
  'lp.minutesOption': '{{min}} minutes / day',
  'lp.goalSavedMsg': 'Learning goal updated!',
  'lp.aiGenBtn': 'AI Path & Materials',
  'lp.aiTrackTag': '[AI]',
  'lp.aiTrackBadge': 'AI Generated',
  'lp.deleteAiTrackBtn': 'Delete AI path',
  'lp.aiTrackCreatedMsg': 'AI created your custom learning path and study materials!',
  'lp.aiTrackDeletedMsg': 'Deleted custom AI learning path.',
  'lp.aiGenModalTitle': 'Create AI Path & Study Materials',
  'lp.aiGenModalSub':
    'Enter any topic, learning goal, or target path — AI automatically builds structured units and full study materials tailored to your need.',
  'lp.aiGoalTopicLabel': 'Your need, topic, or target path',
  'lp.aiGoalTopicPlaceholder': 'e.g., English for IT Interviews',
  'lp.aiPresetsLabel': 'Quick templates:',
  'lp.aiPreset1': 'IT Job Interviews',
  'lp.aiPreset2': 'IELTS Environment Band 6.5',
  'lp.aiPreset3': 'Business Meetings & Emails',
  'lp.aiUnitCountLabel': 'Number of units',
  'lp.aiUnitsOption': '{{count}} units (full materials)',
  'lp.aiFocusLabel': 'Priority focus (optional)',
  'lp.aiGenSubmitBtn': 'Generate with AI',
  'lp.aiGeneratingBtn': 'AI is building path & materials...',
  'lp.aiDisabledWarn': 'AI Tutor is currently off on the server (set AI_PROVIDER=groq).',

  'lpu.backToPath': 'Back to Learning Path',
  'lpu.skillsLabel': 'skills',
  'lpu.unitCompletionLabel': 'Unit completion progress',
  'lpu.allSkillsDoneBanner': 'Great job! You completed all 4 skills in this unit.',
  'lpu.stepVocab': 'Vocabulary',
  'lpu.stepQuiz': 'Listen & Read',
  'lpu.stepWriting': 'Write (AI)',
  'lpu.stepSpeaking': 'Speak (AI)',
  'lpu.vocabHeading': 'Core Unit Vocabulary',
  'lpu.vocabSub':
    'Pre-curated unit words (0 AI tokens). Save to your Notebook to review with 3D Flashcards.',
  'lpu.syncVocabBtn': 'Save all to Notebook',
  'lpu.flashcardBtn': 'Practice 3D Flashcards',
  'lpu.inNotebookBadge': 'In Notebook',
  'lpu.vocabSyncedMsg': 'Saved {{added}} new word(s) to topic "{{topic}}".',
  'lpu.nextQuizBtn': 'Next: Listen & Read',
  'lpu.quizSub':
    'Listen to the passage first, then check comprehension with the mini quiz (0 AI tokens).',
  'lpu.bestScore': 'Best score: {{score}}%',
  'lpu.listenNormalBtn': 'Listen (1.0x)',
  'lpu.listenSlowBtn': 'Listen slower (0.8x)',
  'lpu.showScriptBtn': 'Show English script',
  'lpu.hideScriptBtn': 'Hide English script',
  'lpu.showTransBtn': 'Vietnamese translation',
  'lpu.hideTransBtn': 'Hide translation',
  'lpu.submitQuizBtn': 'Check answers',
  'lpu.quizResultSummary': 'You answered {{correct}}/{{total}} correctly ({{score}}%).',
  'lpu.nextWritingBtn': 'Next: Write with AI',
  'lpu.writingHeading': 'Guided Writing Practice',
  'lpu.targetWordsLabel': 'Try using these unit words:',
  'lpu.aiDisabledNotice':
    'AI Tutor is currently turned off on the server (set AI_PROVIDER=groq to enable Writing & Speaking AI).',
  'lpu.writingInputLabel': 'Your English paragraph',
  'lpu.writingPlaceholder': 'Write your English paragraph...',
  'lpu.showSampleBtn': 'View sample',
  'lpu.hideSampleBtn': 'Hide sample',
  'lpu.evaluateWritingBtn': 'Evaluate for target Band',
  'lpu.evaluatingBtn': 'Evaluating at target Band...',
  'lpu.sampleTitle': 'Band-calibrated sample answer',
  'lpu.writingResultTitle': 'AI Band Feedback',
  'lpu.upgradedTitle': 'Band-calibrated improved version',
  'lpu.nextSpeakingBtn': 'Next: Speak with AI',
  'lpu.speakingHeading': 'Interactive Speaking Practice',
  'lpu.startSpeakingBtn': 'Start AI voice practice',
  'lpu.markSpeakingDoneBtn': 'Mark speaking complete',
  'lpu.speakingReadyTitle': 'Ready to speak on this topic',
  'lpu.speakingReadyDesc':
    'Click Start above to open a guided voice/text conversation with instant AI feedback.',
  'lpu.studyGuideHeading': 'Study Material & Grammar Guide',
  'lpu.studyGuideSub':
    'Key grammar rules, reusable sentence patterns, common mistakes & fast tips.',
  'lpu.studyGuideEmpty':
    'No study guide generated for this unit yet. Click below to create tailored notes with AI.',
  'lpu.showGuideBtn': 'Show study guide',
  'lpu.hideGuideBtn': 'Hide study guide',
  'lpu.genGuideBtn': 'Generate AI study guide',
  'lpu.generatingGuideBtn': 'Creating AI study guide...',
  'lpu.regenUnitBtn': 'Regenerate unit materials',
  'lpu.regeneratingUnitBtn': 'Refreshing materials...',
  'lpu.guideFocusPlaceholder':
    'Optional goal focus (e.g. more speaking examples, formal writing structures...)',
  'lpu.grammarPointsTitle': 'Core Grammar Points',
  'lpu.keyPatternsTitle': 'Useful Sentence Patterns',
  'lpu.commonMistakesTitle': 'Common Mistakes to Avoid',
  'lpu.studyTipsTitle': 'Quick Study Tips',
} as const;

export type LpTxKey = keyof typeof LP_EN_TRANSLATIONS;

export const LP_VI_TRANSLATIONS: Record<LpTxKey, string> = {
  'lp.langEnglish': 'Tiếng Anh',
  'lp.selectBandLabel': 'Chọn Band mục tiêu',
  'lp.courseGoalBtn': 'Mục tiêu khóa học',
  'lp.goalSummaryMeta': 'Hiện tại: {{level}} · {{minutes}} phút/ngày',
  'lp.unitsProgress': 'Hoàn thành {{done}} / {{total}} bài',
  'lp.continueUnitBtn': 'Học tiếp bài đang mở',
  'lp.emptyTitle': 'Chưa có lộ trình học',
  'lp.emptyDesc': 'Hãy chọn Band mục tiêu phía trên để xem các bài học.',
  'lp.vocabNotebookNode': 'Sổ từ vựng',
  'lp.unitCompleted': 'Đã xong 4/4 kỹ năng',
  'lp.unitLockedHint': 'Xem trước được · Xong 2 kỹ năng bài trước để mở',
  'lp.skillsDoneMeta': '{{done}}/{{total}} kỹ năng',
  'lp.goalModalTitle': 'Thiết lập Mục tiêu khóa học',
  'lp.goalModalSubtitle':
    'Argon Learning sẽ điều chỉnh mức chấm Viết AI và độ khó Nói AI bám sát Band bạn chọn.',
  'lp.goalBandLabel': 'Lộ trình Band mục tiêu',
  'lp.currentLevelLabel': 'Trình độ hiện tại của bạn',
  'lp.dailyMinutesLabel': 'Mục tiêu học mỗi ngày',
  'lp.minutesOption': '{{min}} phút / ngày',
  'lp.goalSavedMsg': 'Đã cập nhật mục tiêu khóa học!',
  'lp.aiGenBtn': 'Tạo lộ trình & tài liệu AI',
  'lp.aiTrackTag': '[AI]',
  'lp.aiTrackBadge': 'Tạo bởi AI',
  'lp.deleteAiTrackBtn': 'Xóa lộ trình AI',
  'lp.aiTrackCreatedMsg': 'AI đã tạo xong lộ trình học và bộ tài liệu từng bài!',
  'lp.aiTrackDeletedMsg': 'Đã xóa lộ trình AI tùy chỉnh.',
  'lp.aiGenModalTitle': 'Tạo Lộ trình & Tài liệu học bằng AI',
  'lp.aiGenModalSub':
    'Chỉ cần nhập chủ đề hoặc nhu cầu học của bạn — AI sẽ tự động thiết kế lộ trình kèm tóm tắt ngữ pháp, từ vựng, bài nghe/đọc, viết & nói.',
  'lp.aiGoalTopicLabel': 'Nhu cầu, chủ đề hoặc lộ trình muốn học',
  'lp.aiGoalTopicPlaceholder': 'VD: Tiếng Anh phỏng vấn IT',
  'lp.aiPresetsLabel': 'Gợi ý nhanh:',
  'lp.aiPreset1': 'Phỏng vấn IT Backend',
  'lp.aiPreset2': 'IELTS Môi trường Band 6.5',
  'lp.aiPreset3': 'Giao tiếp họp & Email công sở',
  'lp.aiUnitCountLabel': 'Số lượng bài học',
  'lp.aiUnitsOption': '{{count}} bài học (đủ bộ tài liệu)',
  'lp.aiFocusLabel': 'Trọng tâm ưu tiên (tùy chọn)',
  'lp.aiGenSubmitBtn': 'Tạo bằng AI',
  'lp.aiGeneratingBtn': 'AI đang soạn lộ trình & tài liệu...',
  'lp.aiDisabledWarn': 'AI hiện đang tắt trên server (cấu hình AI_PROVIDER=groq để bật).',

  'lpu.backToPath': 'Về lộ trình học',
  'lpu.skillsLabel': 'kỹ năng',
  'lpu.unitCompletionLabel': 'Tiến độ hoàn thành bài học',
  'lpu.allSkillsDoneBanner': 'Tuyệt vời! Bạn đã hoàn thành trọn vẹn 4 kỹ năng của bài học này.',
  'lpu.stepVocab': 'Từ vựng',
  'lpu.stepQuiz': 'Nghe & Đọc',
  'lpu.stepWriting': 'Viết AI',
  'lpu.stepSpeaking': 'Nói AI',
  'lpu.vocabHeading': 'Từ vựng cốt lõi của bài',
  'lpu.vocabSub': 'Bộ từ chuẩn lưu sẵn (0 AI token). Lưu vào Sổ từ vựng để ôn bằng Thẻ ghi nhớ 3D.',
  'lpu.syncVocabBtn': 'Lưu hết vào Sổ từ vựng',
  'lpu.flashcardBtn': 'Luyện Thẻ ghi nhớ 3D',
  'lpu.inNotebookBadge': 'Đã có trong sổ',
  'lpu.vocabSyncedMsg': 'Đã lưu {{added}} từ mới vào chủ đề "{{topic}}".',
  'lpu.nextQuizBtn': 'Tiếp: Nghe & Đọc hiểu',
  'lpu.quizSub':
    'Nghe đoạn hội thoại mẫu trước, sau đó kiểm tra mức độ hiểu với mini quiz (0 AI token).',
  'lpu.bestScore': 'Điểm cao nhất: {{score}}%',
  'lpu.listenNormalBtn': 'Nghe chuẩn (1.0x)',
  'lpu.listenSlowBtn': 'Nghe chậm (0.8x)',
  'lpu.showScriptBtn': 'Hiện lời tiếng Anh',
  'lpu.hideScriptBtn': 'Ẩn lời tiếng Anh',
  'lpu.showTransBtn': 'Dịch tiếng Việt',
  'lpu.hideTransBtn': 'Ẩn bản dịch',
  'lpu.submitQuizBtn': 'Chấm điểm ngay',
  'lpu.quizResultSummary': 'Bạn trả lời đúng {{correct}}/{{total}} câu ({{score}}%).',
  'lpu.nextWritingBtn': 'Tiếp: Luyện Viết AI',
  'lpu.writingHeading': 'Luyện viết ngắn theo Band mục tiêu',
  'lpu.targetWordsLabel': 'Thử dùng các từ vựng của bài:',
  'lpu.aiDisabledNotice':
    'AI hiện đang tắt trên server (cấu hình AI_PROVIDER=groq để bật chấm Viết & Nói AI).',
  'lpu.writingInputLabel': 'Đoạn văn tiếng Anh của bạn',
  'lpu.writingPlaceholder': 'Viết đoạn văn tiếng Anh của bạn...',
  'lpu.showSampleBtn': 'Xem bài mẫu',
  'lpu.hideSampleBtn': 'Ẩn bài mẫu',
  'lpu.evaluateWritingBtn': 'Chấm bài theo Band',
  'lpu.evaluatingBtn': 'AI đang chấm theo Band mục tiêu...',
  'lpu.sampleTitle': 'Bài mẫu tham khảo đúng Band',
  'lpu.writingResultTitle': 'Nhận xét chi tiết từ AI',
  'lpu.upgradedTitle': 'Phiên bản nâng cấp vừa Band',
  'lpu.nextSpeakingBtn': 'Tiếp: Luyện Nói AI',
  'lpu.speakingHeading': 'Luyện nói phản xạ theo chủ đề bài',
  'lpu.startSpeakingBtn': 'Bắt đầu luyện nói AI',
  'lpu.markSpeakingDoneBtn': 'Đánh dấu hoàn thành Nói',
  'lpu.speakingReadyTitle': 'Sẵn sàng luyện nói chủ đề này',
  'lpu.speakingReadyDesc':
    'Bấm nút Bắt đầu ở trên để vào hội thoại Nói / Gõ với AI chấm đúng sai và hỏi nối tiếp.',
  'lpu.studyGuideHeading': 'Tài liệu bài học & Ngữ pháp trọng tâm',
  'lpu.studyGuideSub': 'Tổng hợp điểm ngữ pháp, cấu trúc câu mẫu, lỗi dễ sai và mẹo ghi nhớ nhanh.',
  'lpu.studyGuideEmpty':
    'Bài này chưa có tài liệu tóm tắt AI riêng. Bấm nút bên dưới để AI tự soạn tài liệu bám sát Band của bạn.',
  'lpu.showGuideBtn': 'Mở tài liệu học',
  'lpu.hideGuideBtn': 'Thu gọn tài liệu',
  'lpu.genGuideBtn': 'Tạo tài liệu học bằng AI',
  'lpu.generatingGuideBtn': 'AI đang soạn tài liệu...',
  'lpu.regenUnitBtn': 'Làm mới toàn bộ bài AI',
  'lpu.regeneratingUnitBtn': 'Đang làm mới bài AI...',
  'lpu.guideFocusPlaceholder':
    'Tùy chọn trọng tâm (VD: ưu tiên giao tiếp thực tế, thêm mẫu câu viết...)',
  'lpu.grammarPointsTitle': 'Ngữ pháp trọng tâm',
  'lpu.keyPatternsTitle': 'Mẫu câu hữu ích',
  'lpu.commonMistakesTitle': 'Lỗi thường gặp cần tránh',
  'lpu.studyTipsTitle': 'Mẹo học nhanh',
};

export function lpTranslate(
  lang: AppLocale,
  key: LpTxKey,
  params?: Record<string, string | number>,
): string {
  const dict = lang === 'vi' ? LP_VI_TRANSLATIONS : LP_EN_TRANSLATIONS;
  let template: string = dict[key] ?? LP_EN_TRANSLATIONS[key] ?? key;

  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      template = template.replaceAll(`{{${paramKey}}}`, String(paramValue));
    }
  }
  return template;
}

@Pipe({
  name: 'lpT',
  pure: false,
})
export class LpTranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: LpTxKey, params?: Record<string, string | number>): string {
    return lpTranslate(this.i18n.lang(), key, params);
  }
}
