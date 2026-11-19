import { Pipe, PipeTransform, inject } from '@angular/core';
import { AppLocale, I18nService } from '../../shared/i18n';

export const STARTER_EN_TRANSLATIONS = {
  'st.backDashboard': 'Back to Dashboard',
  'st.eyebrow': 'Absolute Beginner Studio · A0 → A1',
  'st.title': 'Start From Zero',
  'st.subtitle':
    'Learn letters, sounds, Hangul syllable building, and your first 3-word sentences step by step — zero AI tokens required.',
  'st.speedLabel': 'Audio speed',
  'st.speedSlow': '0.78x Extra slow',
  'st.speedNormal': '0.95x Natural',
  'st.goA0PathBtn': 'Open A0 Learning Path',
  'st.askAiBtn': 'Ask A0 Tutor',

  'st.tabAlphabet': '1. Alphabet & Sounds',
  'st.tabBuilder': '2. Combine & Build',
  'st.tabDrill': '3. Listen & Match',

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
} as const;

export type StarterTxKey = keyof typeof STARTER_EN_TRANSLATIONS;

export const STARTER_VI_TRANSLATIONS: Record<StarterTxKey, string> = {
  'st.backDashboard': 'Về Tổng quan',
  'st.eyebrow': 'Phòng học vỡ lòng · Từ con số 0 (A0 → A1)',
  'st.title': 'Bắt đầu từ con số 0',
  'st.subtitle':
    'Làm quen mặt chữ, phát âm chậm rãi, ghép âm tiết Hangul và nói những câu 3 từ đầu tiên hoàn toàn miễn phí AI token.',
  'st.speedLabel': 'Tốc độ đọc',
  'st.speedSlow': '0.78x Siêu chậm',
  'st.speedNormal': '0.95x Tự nhiên',
  'st.goA0PathBtn': 'Vào Lộ trình A0',
  'st.askAiBtn': 'Hỏi Gia sư A0',

  'st.tabAlphabet': '1. Bảng chữ cái & Âm',
  'st.tabBuilder': '2. Ghép chữ & Lắp câu',
  'st.tabDrill': '3. Nghe & Chọn đúng',

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
