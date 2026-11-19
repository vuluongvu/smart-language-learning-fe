import { Pipe, PipeTransform, inject } from '@angular/core';
import { AppLocale, I18nService } from '../../shared/i18n';

export const STARTER_EN_TRANSLATIONS = {
  'st.backDashboard': 'Back to Dashboard',
  'st.title': 'Start From Zero',
  'st.subtitle':
    'Learn letters, sounds, Hangul syllable building, core beginner grammar, and listening — zero AI tokens required.',
  'st.speedLabel': 'Audio speed',
  'st.speedSlow': '0.78x Extra slow',
  'st.speedNormal': '0.95x Natural',
  'st.goA0PathBtn': 'Open A0 Learning Path',
  'st.askAiBtn': 'Ask A0 Tutor',

  'st.tabAlphabet': '1. Alphabet',
  'st.tabBuilder': '2. Build',
  'st.tabGrammar': '3. Grammar',
  'st.tabDrill': '4. Listen',
  'st.filterAll': 'All',
  'st.enFilterVowels': 'Vowels (5)',
  'st.enFilterConsonants': 'Consonants (21)',
  'st.koFilterConsonants': 'Consonants (14)',
  'st.koFilterVowels': 'Vowels (10)',

  'st.enLettersTitle': '26 English Letters & First Words',
  'st.enLettersDesc':
    'Tap any letter or word to hear clear pronunciation. Coral highlights mark the 5 core vowels (A, E, I, O, U).',
  'st.vowelTag': 'Vowel',
  'st.consonantTag': 'Consonant',
  'st.enPhonicsTitle': 'Key Sound Pairs Made Easy',
  'st.enPhonicsDesc': 'Quick mouth-shape tips for pairs learners often mix up.',
  'st.listenLetter': 'Letter',
  'st.listenWord': 'Word',

  'st.koConsonantsTitle': '14 Basic Korean Consonants (자음)',
  'st.koConsonantsDesc':
    'Listen to each consonant sound, see how it maps cleanly, and trace Hangul strokes.',
  'st.koVowelsTitle': '10 Basic Korean Vowels (모음)',
  'st.koVowelsDesc':
    'Pay attention to ㅇ (silent placeholder when a syllable starts with a vowel).',
  'st.practiceStroke': 'Write',
  'st.writeModalTitle': 'Practice Writing Hangul',
  'st.writeModalDesc': 'Follow animated stroke order first, then write freely on the pad.',

  'st.koMixerTitle': 'Interactive Hangul Syllable Combiner',
  'st.koMixerDesc':
    'Pick a consonant + vowel + optional bottom Batchim to see and hear how Korean square blocks are formed live.',
  'st.koPickConsonant': '1. Pick initial consonant',
  'st.koPickVowel': '2. Pick vowel',
  'st.koPickBatchim': '3. Optional bottom Batchim',
  'st.koCombinedResult': 'Live combined Hangul syllable',
  'st.koWriteCombined': 'Trace this syllable',

  'st.enBuilderTitle': 'Build Your First 3-Block English Sentence',
  'st.enBuilderDesc':
    'Tap Subject + Action + Ending below. Argon automatically matches am/is/are and reads the whole sentence slowly.',
  'st.enPickSubject': '1. Who (Subject)',
  'st.enPickVerb': '2. Action / Be',
  'st.enPickEnding': '3. Description / Noun',
  'st.enSentencePreview': 'Your complete sentence',
  'st.enSpeakSlow': 'Listen slow (0.78x)',
  'st.enSpeakNormal': 'Listen natural',

  'st.drillTitle': 'No-Stress Listen & Match Drill',
  'st.drillDesc':
    'Train your ears first! Press Listen, then pick the matching card. Wrong answers never lose points.',
  'st.drillStreak': 'Correct streak: {{score}} / {{total}}',
  'st.drillPlayPrompt': 'Play pronunciation',
  'st.drillCorrectFeedback': 'Spot on! Listen one more time and tap Next whenever ready.',
  'st.drillWrongFeedback': 'Close! Listen at slow speed again and pick the matching sound.',
  'st.drillNextBtn': 'Next item',
  'st.drillRestartBtn': 'Play again',

  'st.grammarTitle': 'Essential A0–A1 Starter Grammar',
  'st.grammarDesc':
    'Master sentence order, particles/articles, and basic verb forms step by step, then test yourself right below.',
  'st.grammarProgress': 'Mastered: {{done}} / {{total}} points',
  'st.grammarFilterAll': 'All rules',
  'st.grammarFilterOrder': 'Word order',
  'st.grammarFilterParticles': 'Particles / Articles',
  'st.grammarFilterVerbs': 'Verbs & Questions',
  'st.grammarFormulaLabel': 'Formula',
  'st.grammarExamplesLabel': 'Examples',
  'st.grammarAvoidMistake': 'Avoid this mistake',
  'st.grammarMarkDone': 'Mark mastered',
  'st.grammarDone': 'Mastered',
  'st.grammarAskAi': 'Ask AI Tutor',
  'st.grammarListenBtn': 'Listen',
  'st.grammarQuizTitle': 'Quick Grammar Check (No Pressure)',
  'st.grammarQuizDesc': 'Pick the missing piece or natural structure and read why it works.',
  'st.grammarQuizScore': 'Score: {{score}} / {{total}}',
  'st.grammarQuizCorrect': 'Spot on!',
  'st.grammarQuizWrong': 'Not quite — check the grammar tip below:',
  'st.grammarQuizNext': 'Next question',
  'st.grammarQuizRestart': 'Retry grammar check',
  'st.grammarQuizFilterAll': 'All ({{count}})',
  'st.grammarQuizFilterChoice': 'Fill & Choice',
  'st.grammarQuizFilterScramble': 'Word Order',
  'st.grammarQuizFilterAi': 'AI Generated ({{count}})',
  'st.grammarScrambleEmpty': 'Tap word tiles below in the right order...',
  'st.grammarScrambleUndo': 'Undo',
  'st.grammarScrambleClear': 'Clear',
  'st.grammarScrambleCheck': 'Check sentence',
  'st.grammarGenToggle': '+ Create More Grammar & Exercises (AI)',
  'st.grammarGenTitle': 'Create Custom Grammar & Exercises with AI',
  'st.grammarGenDesc':
    'Enter any grammar rule you want to learn — Argon generates a structured lesson card plus 4 interactive exercises right here.',
  'st.grammarGenTopicPlaceholder': 'e.g., Past Simple, Prepositions of time, Korean -(으)세요...',
  'st.grammarGenBtn': 'Generate lesson & 4 exercises',
  'st.grammarGenBusy': 'Creating lesson & exercises...',
  'st.grammarGenCreated': 'Added "{{title}}" + {{count}} new exercises to your Starter studio!',
  'st.grammarGenJumpQuiz': 'Practice new exercises',
  'st.grammarAiBadge': 'AI Created',
  'st.grammarRemoveCustom': 'Remove custom lesson',
  'st.grammarJumpPractice': 'Practice ({{count}})',
  'st.grammarPrevRule': 'Previous',
  'st.grammarNextRule': 'Next lesson',
} as const;

export type StarterTxKey = keyof typeof STARTER_EN_TRANSLATIONS;

export const STARTER_VI_TRANSLATIONS: Record<StarterTxKey, string> = {
  'st.backDashboard': 'Về Tổng quan',
  'st.title': 'Bắt đầu từ con số 0',
  'st.subtitle':
    'Làm quen mặt chữ, phát âm chậm rãi, ghép âm tiết Hangul, nắm ngữ pháp nền tảng và luyện nghe miễn phí AI token.',
  'st.speedLabel': 'Tốc độ đọc',
  'st.speedSlow': '0.78x Siêu chậm',
  'st.speedNormal': '0.95x Tự nhiên',
  'st.goA0PathBtn': 'Vào Lộ trình A0',
  'st.askAiBtn': 'Hỏi Gia sư A0',

  'st.tabAlphabet': '1. Chữ & Âm',
  'st.tabBuilder': '2. Ghép & Câu',
  'st.tabGrammar': '3. Ngữ pháp',
  'st.tabDrill': '4. Nghe & Chọn',
  'st.filterAll': 'Tất cả',
  'st.enFilterVowels': 'Nguyên âm (5)',
  'st.enFilterConsonants': 'Phụ âm (21)',
  'st.koFilterConsonants': 'Phụ âm (14)',
  'st.koFilterVowels': 'Nguyên âm (10)',

  'st.enLettersTitle': '26 Chữ cái tiếng Anh & Từ mẫu đầu tiên',
  'st.enLettersDesc':
    'Chạm từng chữ cái hoặc từ mẫu để nghe phát âm rõ. Các ô nổi bật là 5 nguyên âm chính (A, E, I, O, U).',
  'st.vowelTag': 'Nguyên âm',
  'st.consonantTag': 'Phụ âm',
  'st.enPhonicsTitle': 'Các cặp âm dễ nhầm với người Việt',
  'st.enPhonicsDesc': 'Mẹo đặt lưỡi và khẩu hình đơn giản kèm 2 từ để nghe so sánh ngay.',
  'st.listenLetter': 'Đọc chữ',
  'st.listenWord': 'Đọc từ',

  'st.koConsonantsTitle': '14 Phụ âm cơ bản tiếng Hàn (자음)',
  'st.koConsonantsDesc':
    'Nghe từng phụ âm chuẩn Hàn, xem mẹo đọc tiếng Việt và mở bảng tập viết nét.',
  'st.koVowelsTitle': '10 Nguyên âm cơ bản tiếng Hàn (모음)',
  'st.koVowelsDesc': 'Chú ý âm tròn ㅇ khi đứng đầu là âm câm để ghép cùng nguyên âm.',
  'st.practiceStroke': 'Tập viết',
  'st.writeModalTitle': 'Tập viết chữ Hangul',
  'st.writeModalDesc': 'Xem thứ tự từng nét chuẩn trước rồi tập tô trên bảng.',

  'st.koMixerTitle': 'Bộ ghép âm tiết Hangul trực quan',
  'st.koMixerDesc':
    'Chọn Phụ âm đầu + Nguyên âm + Âm cuối (nếu cần) để thấy ngay khối chữ Hangul thật và nghe phát âm.',
  'st.koPickConsonant': '1. Chọn phụ âm đầu',
  'st.koPickVowel': '2. Chọn nguyên âm',
  'st.koPickBatchim': '3. Chọn âm cuối Batchim (tùy chọn)',
  'st.koCombinedResult': 'Chữ Hangul vừa ghép',
  'st.koWriteCombined': 'Tập viết chữ này',

  'st.enBuilderTitle': 'Lắp ghép câu tiếng Anh 3 mảnh đầu tiên',
  'st.enBuilderDesc':
    'Chọn Chủ ngữ + Động từ + Phần sau để xem câu đúng ngữ pháp tự động và bấm nghe lặp lại.',
  'st.enPickSubject': '1. Ai (Chủ ngữ)',
  'st.enPickVerb': '2. Là / Thích / Muốn',
  'st.enPickEnding': '3. Trạng thái / Đồ vật',
  'st.enSentencePreview': 'Câu hoàn chỉnh của bạn',
  'st.enSpeakSlow': 'Nghe siêu chậm (0.78x)',
  'st.enSpeakNormal': 'Nghe tự nhiên',

  'st.drillTitle': 'Luyện phản xạ tai: Nghe & Chọn đúng (Không áp lực)',
  'st.drillDesc':
    'Bấm nút Nghe phát âm rồi chọn ô chữ đúng bên dưới. Trả lời nhầm không sao cả, nghe lại và thử tiếp nhé!',
  'st.drillStreak': 'Đúng liên tiếp: {{score}} / {{total}}',
  'st.drillPlayPrompt': 'Nghe phát âm',
  'st.drillCorrectFeedback': 'Chính xác! Bạn có thể bấm nghe lại lần nữa rồi qua câu tiếp theo.',
  'st.drillWrongFeedback': 'Gần đúng rồi! Bấm Nghe lại chậm 0.78x rồi chọn lại nhé.',
  'st.drillNextBtn': 'Câu tiếp theo',
  'st.drillRestartBtn': 'Luyện lại từ đầu',

  'st.grammarTitle': 'Ngữ pháp nền tảng cho người mới (A0 → A1)',
  'st.grammarDesc':
    'Nắm chắc trật tự câu, tiểu từ/mạo từ và cách chia động từ cốt lõi trước khi luyện tập nhanh bên dưới.',
  'st.grammarProgress': 'Đã nắm: {{done}} / {{total}} điểm',
  'st.grammarFilterAll': 'Tất cả quy tắc',
  'st.grammarFilterOrder': 'Trật tự câu',
  'st.grammarFilterParticles': 'Tiểu từ / Mạo từ',
  'st.grammarFilterVerbs': 'Động từ & Hỏi/Phủ định',
  'st.grammarFormulaLabel': 'Công thức',
  'st.grammarExamplesLabel': 'Ví dụ mẫu',
  'st.grammarAvoidMistake': 'Tránh lỗi hay gặp',
  'st.grammarMarkDone': 'Đánh dấu đã hiểu',
  'st.grammarDone': 'Đã nắm',
  'st.grammarAskAi': 'Hỏi Gia sư AI',
  'st.grammarListenBtn': 'Nghe',
  'st.grammarQuizTitle': 'Luyện nhanh Ngữ pháp (Không trừ điểm)',
  'st.grammarQuizDesc': 'Chọn mảnh ghép còn thiếu hoặc câu đúng tự nhiên rồi xem giải thích ngay.',
  'st.grammarQuizScore': 'Đúng: {{score}} / {{total}}',
  'st.grammarQuizCorrect': 'Chính xác!',
  'st.grammarQuizWrong': 'Chưa chuẩn lắm — xem giải thích bên dưới nhé:',
  'st.grammarQuizNext': 'Câu tiếp theo',
  'st.grammarQuizRestart': 'Làm lại bộ ngữ pháp',
  'st.grammarQuizFilterAll': 'Tất cả ({{count}})',
  'st.grammarQuizFilterChoice': 'Chọn đáp án',
  'st.grammarQuizFilterScramble': 'Sắp xếp câu',
  'st.grammarQuizFilterAi': 'AI vừa tạo ({{count}})',
  'st.grammarScrambleEmpty': 'Chạm từng mảnh từ bên dưới theo đúng trật tự câu...',
  'st.grammarScrambleUndo': 'Bỏ 1 từ',
  'st.grammarScrambleClear': 'Xóa chọn',
  'st.grammarScrambleCheck': 'Kiểm tra câu',
  'st.grammarGenToggle': '+ Tạo thêm Ngữ pháp & Bài tập (AI)',
  'st.grammarGenTitle': 'Tạo thêm Ngữ pháp & Bài tập theo ý bạn (AI)',
  'st.grammarGenDesc':
    'Nhập bất kỳ điểm ngữ pháp nào muốn học thêm — Argon sẽ tạo thẻ công thức chuẩn cùng 4 bài tập tương tác ngay bên dưới.',
  'st.grammarGenTopicPlaceholder': 'VD: Thì quá khứ đơn, So sánh hơn, Đuôi -(으)세요...',
  'st.grammarGenBtn': 'Tạo ngữ pháp & 4 bài tập',
  'st.grammarGenBusy': 'Đang soạn bài & bài tập...',
  'st.grammarGenCreated': 'Đã thêm "{{title}}" cùng {{count}} bài tập mới vào Starter!',
  'st.grammarGenJumpQuiz': 'Làm ngay bài vừa tạo',
  'st.grammarAiBadge': 'Tạo bởi AI',
  'st.grammarRemoveCustom': 'Xóa bài tự tạo',
  'st.grammarJumpPractice': 'Làm bài ({{count}})',
  'st.grammarPrevRule': 'Bài trước',
  'st.grammarNextRule': 'Bài tiếp theo',
};

export function starterTranslate(
  lang: AppLocale,
  key: StarterTxKey,
  params?: Record<string, string | number>,
): string {
  const dict = lang === 'vi' ? STARTER_VI_TRANSLATIONS : STARTER_EN_TRANSLATIONS;
  let text: string = dict[key] ?? STARTER_EN_TRANSLATIONS[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{{${k}}}`, String(v));
    }
  }
  return text;
}

@Pipe({ name: 'stT', pure: false })
export class StarterTranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: StarterTxKey, params?: Record<string, string | number>): string {
    return starterTranslate(this.i18n.lang(), key, params);
  }
}
