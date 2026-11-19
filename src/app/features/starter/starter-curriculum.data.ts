import type { LearningLanguageCode } from '../../shared/types/learning-language.types';

export interface EnglishLetterCard {
  letter: string;
  lowercase: string;
  nameIpa: string;
  viHint: string;
  sampleWord: string;
  sampleIpa: string;
  sampleMeaningVi: string;
  sampleMeaningEn: string;
  isVowel: boolean;
}

export interface EnglishPhonicsTip {
  id: string;
  symbol: string;
  labelVi: string;
  labelEn: string;
  tipVi: string;
  tipEn: string;
  wordA: string;
  wordB: string;
}

export interface KoreanJamoCard {
  jamo: string;
  name: string;
  roman: string;
  tipVi: string;
  tipEn: string;
  sampleWord: string;
  sampleReading: string;
  sampleMeaningVi: string;
  sampleMeaningEn: string;
  jamoIndex: number;
  kind: 'consonant' | 'vowel';
}

export interface KoreanBatchimOption {
  label: string;
  finalIndex: number;
  roman: string;
}

export interface SentenceBlockOption {
  text: string;
  meaningVi: string;
  meaningEn: string;
}

export interface StarterDrillQuestion {
  id: string;
  promptAudioText: string;
  hintVi: string;
  hintEn: string;
  correctOption: string;
  options: string[];
}

export const ENGLISH_ALPHABET: EnglishLetterCard[] = [
  {
    letter: 'A',
    lowercase: 'a',
    nameIpa: '/eɪ/',
    viHint: 'ây',
    sampleWord: 'Apple',
    sampleIpa: '/ˈæpl/',
    sampleMeaningVi: 'Quả táo',
    sampleMeaningEn: 'Apple',
    isVowel: true,
  },
  {
    letter: 'B',
    lowercase: 'b',
    nameIpa: '/biː/',
    viHint: 'bi',
    sampleWord: 'Book',
    sampleIpa: '/bʊk/',
    sampleMeaningVi: 'Quyển sách',
    sampleMeaningEn: 'Book',
    isVowel: false,
  },
  {
    letter: 'C',
    lowercase: 'c',
    nameIpa: '/siː/',
    viHint: 'xi',
    sampleWord: 'Cat',
    sampleIpa: '/kæt/',
    sampleMeaningVi: 'Con mèo',
    sampleMeaningEn: 'Cat',
    isVowel: false,
  },
  {
    letter: 'D',
    lowercase: 'd',
    nameIpa: '/diː/',
    viHint: 'đi',
    sampleWord: 'Day',
    sampleIpa: '/deɪ/',
    sampleMeaningVi: 'Ngày',
    sampleMeaningEn: 'Day',
    isVowel: false,
  },
  {
    letter: 'E',
    lowercase: 'e',
    nameIpa: '/iː/',
    viHint: 'i',
    sampleWord: 'Egg',
    sampleIpa: '/eɡ/',
    sampleMeaningVi: 'Quả trứng',
    sampleMeaningEn: 'Egg',
    isVowel: true,
  },
  {
    letter: 'F',
    lowercase: 'f',
    nameIpa: '/ef/',
    viHint: 'ép',
    sampleWord: 'Fish',
    sampleIpa: '/fɪʃ/',
    sampleMeaningVi: 'Con cá',
    sampleMeaningEn: 'Fish',
    isVowel: false,
  },
  {
    letter: 'G',
    lowercase: 'g',
    nameIpa: '/dʒiː/',
    viHint: 'gi',
    sampleWord: 'Good',
    sampleIpa: '/ɡʊd/',
    sampleMeaningVi: 'Tốt / khỏe',
    sampleMeaningEn: 'Good',
    isVowel: false,
  },
  {
    letter: 'H',
    lowercase: 'h',
    nameIpa: '/eɪtʃ/',
    viHint: 'ếch',
    sampleWord: 'Home',
    sampleIpa: '/hoʊm/',
    sampleMeaningVi: 'Ngôi nhà',
    sampleMeaningEn: 'Home',
    isVowel: false,
  },
  {
    letter: 'I',
    lowercase: 'i',
    nameIpa: '/aɪ/',
    viHint: 'ai',
    sampleWord: 'Ice',
    sampleIpa: '/aɪs/',
    sampleMeaningVi: 'Đá lạnh',
    sampleMeaningEn: 'Ice',
    isVowel: true,
  },
  {
    letter: 'J',
    lowercase: 'j',
    nameIpa: '/dʒeɪ/',
    viHint: 'giây',
    sampleWord: 'Job',
    sampleIpa: '/dʒɑːb/',
    sampleMeaningVi: 'Công việc',
    sampleMeaningEn: 'Job',
    isVowel: false,
  },
  {
    letter: 'K',
    lowercase: 'k',
    nameIpa: '/keɪ/',
    viHint: 'kây',
    sampleWord: 'Key',
    sampleIpa: '/kiː/',
    sampleMeaningVi: 'Chìa khóa',
    sampleMeaningEn: 'Key',
    isVowel: false,
  },
  {
    letter: 'L',
    lowercase: 'l',
    nameIpa: '/el/',
    viHint: 'eo',
    sampleWord: 'Love',
    sampleIpa: '/lʌv/',
    sampleMeaningVi: 'Yêu thích',
    sampleMeaningEn: 'Love',
    isVowel: false,
  },
  {
    letter: 'M',
    lowercase: 'm',
    nameIpa: '/em/',
    viHint: 'em',
    sampleWord: 'Milk',
    sampleIpa: '/mɪlk/',
    sampleMeaningVi: 'Sữa',
    sampleMeaningEn: 'Milk',
    isVowel: false,
  },
  {
    letter: 'N',
    lowercase: 'n',
    nameIpa: '/en/',
    viHint: 'en',
    sampleWord: 'Name',
    sampleIpa: '/neɪm/',
    sampleMeaningVi: 'Tên gọi',
    sampleMeaningEn: 'Name',
    isVowel: false,
  },
  {
    letter: 'O',
    lowercase: 'o',
    nameIpa: '/oʊ/',
    viHint: 'âu',
    sampleWord: 'Open',
    sampleIpa: '/ˈoʊpən/',
    sampleMeaningVi: 'Mở ra',
    sampleMeaningEn: 'Open',
    isVowel: true,
  },
  {
    letter: 'P',
    lowercase: 'p',
    nameIpa: '/piː/',
    viHint: 'pi (bật hơi)',
    sampleWord: 'Pen',
    sampleIpa: '/pen/',
    sampleMeaningVi: 'Cây bút',
    sampleMeaningEn: 'Pen',
    isVowel: false,
  },
  {
    letter: 'Q',
    lowercase: 'q',
    nameIpa: '/kjuː/',
    viHint: 'kiu',
    sampleWord: 'Quiet',
    sampleIpa: '/ˈkwaɪət/',
    sampleMeaningVi: 'Yên tĩnh',
    sampleMeaningEn: 'Quiet',
    isVowel: false,
  },
  {
    letter: 'R',
    lowercase: 'r',
    nameIpa: '/ɑːr/',
    viHint: 'a-rờ (uốn lưỡi)',
    sampleWord: 'Rice',
    sampleIpa: '/raɪs/',
    sampleMeaningVi: 'Cơm / gạo',
    sampleMeaningEn: 'Rice',
    isVowel: false,
  },
  {
    letter: 'S',
    lowercase: 's',
    nameIpa: '/es/',
    viHint: 'ét-sì',
    sampleWord: 'Sun',
    sampleIpa: '/sʌn/',
    sampleMeaningVi: 'Mặt trời',
    sampleMeaningEn: 'Sun',
    isVowel: false,
  },
  {
    letter: 'T',
    lowercase: 't',
    nameIpa: '/tiː/',
    viHint: 'ti (bật nhẹ)',
    sampleWord: 'Tea',
    sampleIpa: '/tiː/',
    sampleMeaningVi: 'Trà',
    sampleMeaningEn: 'Tea',
    isVowel: false,
  },
  {
    letter: 'U',
    lowercase: 'u',
    nameIpa: '/juː/',
    viHint: 'iu',
    sampleWord: 'Up',
    sampleIpa: '/ʌp/',
    sampleMeaningVi: 'Lên trên',
    sampleMeaningEn: 'Up',
    isVowel: true,
  },
  {
    letter: 'V',
    lowercase: 'v',
    nameIpa: '/viː/',
    viHint: 'vi (răng chạm môi)',
    sampleWord: 'Very',
    sampleIpa: '/ˈveri/',
    sampleMeaningVi: 'Rất',
    sampleMeaningEn: 'Very',
    isVowel: false,
  },
  {
    letter: 'W',
    lowercase: 'w',
    nameIpa: '/ˈdʌbljuː/',
    viHint: 'đắp-bờ-liu',
    sampleWord: 'Water',
    sampleIpa: '/ˈwɔːtər/',
    sampleMeaningVi: 'Nước uống',
    sampleMeaningEn: 'Water',
    isVowel: false,
  },
  {
    letter: 'X',
    lowercase: 'x',
    nameIpa: '/eks/',
    viHint: 'éc-xì',
    sampleWord: 'Box',
    sampleIpa: '/bɑːks/',
    sampleMeaningVi: 'Cái hộp',
    sampleMeaningEn: 'Box',
    isVowel: false,
  },
  {
    letter: 'Y',
    lowercase: 'y',
    nameIpa: '/waɪ/',
    viHint: 'oai',
    sampleWord: 'Yes',
    sampleIpa: '/jes/',
    sampleMeaningVi: 'Vâng / có',
    sampleMeaningEn: 'Yes',
    isVowel: false,
  },
  {
    letter: 'Z',
    lowercase: 'z',
    nameIpa: '/ziː/',
    viHint: 'di (rung cổ)',
    sampleWord: 'Zero',
    sampleIpa: '/ˈzɪroʊ/',
    sampleMeaningVi: 'Số không',
    sampleMeaningEn: 'Zero',
    isVowel: false,
  },
];

export const ENGLISH_PHONICS_TIPS: EnglishPhonicsTip[] = [
  {
    id: 'ae-e',
    symbol: '/æ/ vs /e/',
    labelVi: 'A bẹt miệng vs E ngắn',
    labelEn: 'Short /æ/ vs /e/',
    tipVi: 'Âm /æ/ hạ cằm mở miệng rộng hơn (cat); âm /e/ mở miệng vừa thoải mái (pen).',
    tipEn: 'Open your jaw wider for /æ/ (cat); keep your mouth relaxed for /e/ (pen).',
    wordA: 'cat',
    wordB: 'pen',
  },
  {
    id: 'ee-i',
    symbol: '/iː/ vs /ɪ/',
    labelVi: 'I kéo dài vs I ngắn dứt khoát',
    labelEn: 'Long /iː/ vs Short /ɪ/',
    tipVi: 'Cười nhẹ và kéo dài âm /iː/ (sheep); thả lỏng nhanh cho âm /ɪ/ (ship).',
    tipEn: 'Stretch with a slight smile for /iː/ (sheep); keep /ɪ/ quick and relaxed (ship).',
    wordA: 'sheep',
    wordB: 'ship',
  },
  {
    id: 'th-pair',
    symbol: '/θ/ vs /ð/',
    labelVi: 'Cặp âm TH đặc trưng',
    labelEn: 'The TH sounds',
    tipVi:
      'Đặt nhẹ đầu lưỡi giữa hai răng cửa rồi thổi hơi: không rung cổ (thank), rung cổ (this).',
    tipEn: 'Gently place tongue tip between front teeth: unvoiced (thank), voiced (this).',
    wordA: 'thank',
    wordB: 'this',
  },
  {
    id: 'sh-ch',
    symbol: '/ʃ/ vs /tʃ/',
    labelVi: 'SH nhẹ mượt vs CH bật hơi',
    labelEn: 'Smooth SH vs Crisp CH',
    tipVi: 'Chu môi nhẹ: "sh" thổi hơi đều (she); "ch" bật dứt khoát (chair).',
    tipEn: 'Round lips lightly: flow air steadily for SH (she), release crisp puff for CH (chair).',
    wordA: 'she',
    wordB: 'chair',
  },
];

export const EN_SENTENCE_SUBJECTS: SentenceBlockOption[] = [
  { text: 'I', meaningVi: 'Tôi', meaningEn: 'I' },
  { text: 'You', meaningVi: 'Bạn', meaningEn: 'You' },
  { text: 'We', meaningVi: 'Chúng tôi', meaningEn: 'We' },
  { text: 'He', meaningVi: 'Anh ấy', meaningEn: 'He' },
  { text: 'She', meaningVi: 'Cô ấy', meaningEn: 'She' },
];

export const EN_SENTENCE_VERBS: Array<{
  text: string;
  meaningVi: string;
  meaningEn: string;
  beFormForSubject?: Record<string, string>;
  thirdSingular?: string;
}> = [
  {
    text: 'am',
    meaningVi: 'là / thì',
    meaningEn: 'am / is / are',
    beFormForSubject: { I: 'am', You: 'are', We: 'are', He: 'is', She: 'is' },
  },
  { text: 'like', meaningVi: 'thích', meaningEn: 'like(s)', thirdSingular: 'likes' },
  { text: 'want', meaningVi: 'muốn', meaningEn: 'want(s)', thirdSingular: 'wants' },
  { text: 'have', meaningVi: 'có', meaningEn: 'have / has', thirdSingular: 'has' },
];

export const EN_SENTENCE_OBJECTS: SentenceBlockOption[] = [
  { text: 'happy today', meaningVi: 'rất vui hôm nay', meaningEn: 'happy today' },
  { text: 'a student', meaningVi: 'một học sinh', meaningEn: 'a student' },
  { text: 'coffee', meaningVi: 'cà phê', meaningEn: 'coffee' },
  { text: 'water', meaningVi: 'nước uống', meaningEn: 'water' },
  { text: 'from Vietnam', meaningVi: 'đến từ Việt Nam', meaningEn: 'from Vietnam' },
];

export function resolveVerbForm(
  subject: string,
  verbSpec: (typeof EN_SENTENCE_VERBS)[number],
): string {
  if (verbSpec.beFormForSubject) {
    return verbSpec.beFormForSubject[subject] ?? 'is';
  }
  if ((subject === 'He' || subject === 'She') && verbSpec.thirdSingular) {
    return verbSpec.thirdSingular;
  }
  return verbSpec.text;
}

// Ordered indices match Unicode Hangul Jamo Lead (Choseong) table (0..18)
export const KOREAN_CONSONANTS: KoreanJamoCard[] = [
  {
    jamo: 'ㄱ',
    name: '기역',
    roman: 'g / k',
    tipVi: 'Đầu chữ đọc nhẹ giữa g và k; cuối âm đọc như c/k nhẹ.',
    tipEn: 'Soft g/k at the start; light final k.',
    sampleWord: '가방',
    sampleReading: 'ga-bang',
    sampleMeaningVi: 'Cặp sách',
    sampleMeaningEn: 'Bag',
    jamoIndex: 0,
    kind: 'consonant',
  },
  {
    jamo: 'ㄴ',
    name: '니은',
    roman: 'n',
    tipVi: 'Giống hệt chữ N tiếng Việt.',
    tipEn: 'Clean N sound.',
    sampleWord: '나무',
    sampleReading: 'na-mu',
    sampleMeaningVi: 'Cái cây',
    sampleMeaningEn: 'Tree',
    jamoIndex: 2,
    kind: 'consonant',
  },
  {
    jamo: 'ㄷ',
    name: '디귿',
    roman: 'd / t',
    tipVi: 'Nhẹ giữa đ/d và t không bật hơi mạnh.',
    tipEn: 'Soft unaspirated d/t.',
    sampleWord: '도시',
    sampleReading: 'do-si',
    sampleMeaningVi: 'Thành phố',
    sampleMeaningEn: 'City',
    jamoIndex: 3,
    kind: 'consonant',
  },
  {
    jamo: 'ㄹ',
    name: '리을',
    roman: 'r / l',
    tipVi: 'Giữa âm tiết đọc nhẹ như r; cuối âm tiết uốn lưỡi thành l.',
    tipEn: 'Soft tap r before vowel; light l at syllable end.',
    sampleWord: '라면',
    sampleReading: 'ra-myeon',
    sampleMeaningVi: 'Mì gói',
    sampleMeaningEn: 'Ramen',
    jamoIndex: 5,
    kind: 'consonant',
  },
  {
    jamo: 'ㅁ',
    name: '미음',
    roman: 'm',
    tipVi: 'Giống hệt chữ M tiếng Việt.',
    tipEn: 'Clean M sound.',
    sampleWord: '모자',
    sampleReading: 'mo-ja',
    sampleMeaningVi: 'Cái mũ',
    sampleMeaningEn: 'Hat',
    jamoIndex: 6,
    kind: 'consonant',
  },
  {
    jamo: 'ㅂ',
    name: '비읍',
    roman: 'b / p',
    tipVi: 'Khép môi đọc nhẹ giữa b và p.',
    tipEn: 'Soft bilabial b/p.',
    sampleWord: '바다',
    sampleReading: 'ba-da',
    sampleMeaningVi: 'Biển',
    sampleMeaningEn: 'Sea',
    jamoIndex: 7,
    kind: 'consonant',
  },
  {
    jamo: 'ㅅ',
    name: '시옷',
    roman: 's',
    tipVi: 'Đọc s nhẹ; đứng trước ㅣ đọc gần giống "x/sh".',
    tipEn: 'Soft s (becomes sh before i).',
    sampleWord: '사과',
    sampleReading: 'sa-gwa',
    sampleMeaningVi: 'Quả táo',
    sampleMeaningEn: 'Apple',
    jamoIndex: 9,
    kind: 'consonant',
  },
  {
    jamo: 'ㅇ',
    name: '이응',
    roman: 'câm / -ng',
    tipVi: 'Đứng ĐẦU chữ là ÂM CÂM; đứng CUỐI đọc là "-ng".',
    tipEn: 'Silent at start; "-ng" at the bottom (Batchim).',
    sampleWord: '아이',
    sampleReading: 'a-i',
    sampleMeaningVi: 'Em bé',
    sampleMeaningEn: 'Child',
    jamoIndex: 11,
    kind: 'consonant',
  },
  {
    jamo: 'ㅈ',
    name: '지읒',
    roman: 'j',
    tipVi: 'Mặt lưỡi chạm vòm miệng nhẹ (gần gi/ch nhẹ).',
    tipEn: 'Soft palatal j.',
    sampleWord: '집',
    sampleReading: 'jip',
    sampleMeaningVi: 'Ngôi nhà',
    sampleMeaningEn: 'Home',
    jamoIndex: 12,
    kind: 'consonant',
  },
  {
    jamo: 'ㅊ',
    name: '치읓',
    roman: 'ch (bật hơi)',
    tipVi: 'Như ㅈ nhưng thổi mạnh luồng hơi ra.',
    tipEn: 'Strongly aspirated ch.',
    sampleWord: '책',
    sampleReading: 'chaek',
    sampleMeaningVi: 'Quyển sách',
    sampleMeaningEn: 'Book',
    jamoIndex: 14,
    kind: 'consonant',
  },
  {
    jamo: 'ㅋ',
    name: '키읔',
    roman: 'k (bật hơi)',
    tipVi: 'Như ㄱ nhưng bật hơi mạnh hơn hẳn.',
    tipEn: 'Strongly aspirated k.',
    sampleWord: '커피',
    sampleReading: 'keo-pi',
    sampleMeaningVi: 'Cà phê',
    sampleMeaningEn: 'Coffee',
    jamoIndex: 15,
    kind: 'consonant',
  },
  {
    jamo: 'ㅌ',
    name: '티읕',
    roman: 't (bật hơi)',
    tipVi: 'Đọc như "thờ" bật hơi nhẹ gió.',
    tipEn: 'Strongly aspirated t.',
    sampleWord: '토마토',
    sampleReading: 'to-ma-to',
    sampleMeaningVi: 'Cà chua',
    sampleMeaningEn: 'Tomato',
    jamoIndex: 16,
    kind: 'consonant',
  },
  {
    jamo: 'ㅍ',
    name: '피읖',
    roman: 'p (bật hơi)',
    tipVi: 'Mím môi bật luồng hơi ra ("p" gió).',
    tipEn: 'Strongly aspirated p.',
    sampleWord: '포도',
    sampleReading: 'po-do',
    sampleMeaningVi: 'Quả nho',
    sampleMeaningEn: 'Grape',
    jamoIndex: 17,
    kind: 'consonant',
  },
  {
    jamo: 'ㅎ',
    name: '히읗',
    roman: 'h',
    tipVi: 'Giống chữ H tiếng Việt.',
    tipEn: 'Clean H sound.',
    sampleWord: '하늘',
    sampleReading: 'ha-neul',
    sampleMeaningVi: 'Bầu trời',
    sampleMeaningEn: 'Sky',
    jamoIndex: 18,
    kind: 'consonant',
  },
];

// Ordered indices match Unicode Hangul Jamo Medial (Jungseong) table (0..20)
export const KOREAN_VOWELS: KoreanJamoCard[] = [
  {
    jamo: 'ㅏ',
    name: '아',
    roman: 'a',
    tipVi: 'Nét dọc viết bên PHẢI phụ âm, đọc "a".',
    tipEn: 'Right side, open "a".',
    sampleWord: '아기',
    sampleReading: 'a-gi',
    sampleMeaningVi: 'Em bé',
    sampleMeaningEn: 'Baby',
    jamoIndex: 0,
    kind: 'vowel',
  },
  {
    jamo: 'ㅑ',
    name: '야',
    roman: 'ya',
    tipVi: 'Thêm 1 nét ngang thành "i-a" đọc liền "ya".',
    tipEn: 'Quick y + a ("ya").',
    sampleWord: '야구',
    sampleReading: 'ya-gu',
    sampleMeaningVi: 'Bóng chày',
    sampleMeaningEn: 'Baseball',
    jamoIndex: 2,
    kind: 'vowel',
  },
  {
    jamo: 'ㅓ',
    name: '어',
    roman: 'eo',
    tipVi: 'Miệng thả dọc tự nhiên như giữa "ơ" và "o" không chu môi.',
    tipEn: 'Neutral open "eo" (unrounded).',
    sampleWord: '어머니',
    sampleReading: 'eo-meo-ni',
    sampleMeaningVi: 'Mẹ',
    sampleMeaningEn: 'Mother',
    jamoIndex: 4,
    kind: 'vowel',
  },
  {
    jamo: 'ㅕ',
    name: '여',
    roman: 'yeo',
    tipVi: 'Bắt đầu bằng y nhẹ rồi sang 어 ("yơ").',
    tipEn: 'y + eo glide.',
    sampleWord: '여우',
    sampleReading: 'yeo-u',
    sampleMeaningVi: 'Con cáo',
    sampleMeaningEn: 'Fox',
    jamoIndex: 6,
    kind: 'vowel',
  },
  {
    jamo: 'ㅗ',
    name: '오',
    roman: 'o',
    tipVi: 'Nét ngang nằm BÊN DƯỚI phụ âm, chu môi tròn đọc "ô".',
    tipEn: 'Written below, rounded "o".',
    sampleWord: '오이',
    sampleReading: 'o-i',
    sampleMeaningVi: 'Dưa chuột',
    sampleMeaningEn: 'Cucumber',
    jamoIndex: 8,
    kind: 'vowel',
  },
  {
    jamo: 'ㅛ',
    name: '요',
    roman: 'yo',
    tipVi: 'Hay gặp ở cuối câu lịch sự (-아요/-어요).',
    tipEn: 'y + o glide.',
    sampleWord: '요리',
    sampleReading: 'yo-ri',
    sampleMeaningVi: 'Nấu ăn',
    sampleMeaningEn: 'Cooking',
    jamoIndex: 12,
    kind: 'vowel',
  },
  {
    jamo: 'ㅜ',
    name: '우',
    roman: 'u',
    tipVi: 'Nét chỉ xuống DƯỚI phụ âm, chu môi đọc "u".',
    tipEn: 'Written below, rounded "u".',
    sampleWord: '우유',
    sampleReading: 'u-yu',
    sampleMeaningVi: 'Sữa',
    sampleMeaningEn: 'Milk',
    jamoIndex: 13,
    kind: 'vowel',
  },
  {
    jamo: 'ㅠ',
    name: '유',
    roman: 'yu',
    tipVi: 'Nối nhanh y + u -> "iu".',
    tipEn: 'y + u glide.',
    sampleWord: '유리',
    sampleReading: 'yu-ri',
    sampleMeaningVi: 'Thủy tinh',
    sampleMeaningEn: 'Glass',
    jamoIndex: 17,
    kind: 'vowel',
  },
  {
    jamo: 'ㅡ',
    name: '으',
    roman: 'eu',
    tipVi: 'Kéo nhẹ khóe miệng sang ngang đọc "ư".',
    tipEn: 'Flat lips, back vowel "eu".',
    sampleWord: '으뜸',
    sampleReading: 'eu-tteum',
    sampleMeaningVi: 'Hàng đầu',
    sampleMeaningEn: 'The best',
    jamoIndex: 18,
    kind: 'vowel',
  },
  {
    jamo: 'ㅣ',
    name: '이',
    roman: 'i',
    tipVi: 'Nét thẳng đứng viết bên phải, đọc như "i".',
    tipEn: 'Vertical stroke, clean "i".',
    sampleWord: '이름',
    sampleReading: 'i-reum',
    sampleMeaningVi: 'Tên',
    sampleMeaningEn: 'Name',
    jamoIndex: 20,
    kind: 'vowel',
  },
];

export const KOREAN_BATCHIM_OPTIONS: KoreanBatchimOption[] = [
  { label: '∅ (Không đuôi)', finalIndex: 0, roman: '' },
  { label: 'ㄱ (-k)', finalIndex: 1, roman: 'k' },
  { label: 'ㄴ (-n)', finalIndex: 4, roman: 'n' },
  { label: 'ㄹ (-l)', finalIndex: 8, roman: 'l' },
  { label: 'ㅁ (-m)', finalIndex: 16, roman: 'm' },
  { label: 'ㅂ (-p)', finalIndex: 17, roman: 'p' },
  { label: 'ㅇ (-ng)', finalIndex: 21, roman: 'ng' },
];

const INITIAL_ROMAN_BY_INDEX: Record<number, string> = {
  0: 'g',
  2: 'n',
  3: 'd',
  5: 'r',
  6: 'm',
  7: 'b',
  9: 's',
  11: '',
  12: 'j',
  14: 'ch',
  15: 'k',
  16: 't',
  17: 'p',
  18: 'h',
};

const VOWEL_ROMAN_BY_INDEX: Record<number, string> = {
  0: 'a',
  2: 'ya',
  4: 'eo',
  6: 'yeo',
  8: 'o',
  12: 'yo',
  13: 'u',
  17: 'yu',
  18: 'eu',
  20: 'i',
};

export function composeHangulSyllable(
  initialIndex: number,
  vowelIndex: number,
  finalIndex = 0,
): { char: string; roman: string } {
  const codePoint = 0xac00 + (initialIndex * 21 + vowelIndex) * 28 + finalIndex;
  const char = String.fromCharCode(codePoint);
  const initR = INITIAL_ROMAN_BY_INDEX[initialIndex] ?? '';
  const vowelR = VOWEL_ROMAN_BY_INDEX[vowelIndex] ?? 'a';
  const batchim = KOREAN_BATCHIM_OPTIONS.find((b) => b.finalIndex === finalIndex)?.roman ?? '';
  return {
    char,
    roman: `${initR}${vowelR}${batchim}`,
  };
}

export function buildStarterQuizPool(lang: LearningLanguageCode): StarterDrillQuestion[] {
  if (lang === 'ko') {
    return [
      {
        id: 'ko-d1',
        promptAudioText: '아',
        hintVi: 'Nguyên âm đơn nét dọc bên phải (âm câm ㅇ)',
        hintEn: 'Basic vowel "a" with silent initial',
        correctOption: '아 (a)',
        options: ['아 (a)', '오 (o)', '우 (u)', '이 (i)'],
      },
      {
        id: 'ko-d2',
        promptAudioText: '우유',
        hintVi: 'Từ 2 âm tiết nghĩa là "sữa"',
        hintEn: '2-syllable word meaning "milk"',
        correctOption: '우유 (u-yu)',
        options: ['아이 (a-i)', '우유 (u-yu)', '오이 (o-i)', '여우 (yeo-u)'],
      },
      {
        id: 'ko-d3',
        promptAudioText: '나무',
        hintVi: 'ㄴ + ㅏ và ㅁ + ㅜ ("cái cây")',
        hintEn: 'Consonant word meaning "tree"',
        correctOption: '나무 (na-mu)',
        options: ['바다 (ba-da)', '모자 (mo-ja)', '나무 (na-mu)', '가방 (ga-bang)'],
      },
      {
        id: 'ko-d4',
        promptAudioText: '물',
        hintVi: 'Từ có Batchim ㄹ ở cuối ("nước")',
        hintEn: 'Batchim word meaning "water"',
        correctOption: '물 (mul)',
        options: ['물 (mul)', '밥 (bap)', '집 (jip)', '산 (san)'],
      },
      {
        id: 'ko-d5',
        promptAudioText: '안녕하세요',
        hintVi: 'Lời chào lịch sự quen thuộc nhất',
        hintEn: 'Most common polite greeting',
        correctOption: '안녕하세요',
        options: ['안녕하세요', '감사합니다', '죄송합니다', '주세요'],
      },
      {
        id: 'ko-d6',
        promptAudioText: '커피',
        hintVi: 'Phụ âm bật hơi ㅋ + ㅓ và ㅍ + ㅣ',
        hintEn: 'Aspirated consonant word for "coffee"',
        correctOption: '커피 (keo-pi)',
        options: ['커피 (keo-pi)', '사과 (sa-gwa)', '포도 (po-do)', '모자 (mo-ja)'],
      },
    ];
  }

  return [
    {
      id: 'en-d1',
      promptAudioText: 'apple',
      hintVi: 'Từ mẫu cho chữ A (/ˈæpl/)',
      hintEn: 'Starter word for letter A (/ˈæpl/)',
      correctOption: 'Apple',
      options: ['Apple', 'Book', 'Water', 'Milk'],
    },
    {
      id: 'en-d2',
      promptAudioText: 'water',
      hintVi: 'Đồ uống sinh tồn hằng ngày (/ˈwɔːtər/)',
      hintEn: 'Essential drink (/ˈwɔːtər/)',
      correctOption: 'Water',
      options: ['Rice', 'Tea', 'Water', 'Pen'],
    },
    {
      id: 'en-d3',
      promptAudioText: 'thank you',
      hintVi: 'Lời cảm ơn lịch sự',
      hintEn: 'Polite gratitude phrase',
      correctOption: 'Thank you',
      options: ['Sorry', 'Hello', 'Thank you', 'Good'],
    },
    {
      id: 'en-d4',
      promptAudioText: 'twenty',
      hintVi: 'Số đếm 20',
      hintEn: 'Number 20',
      correctOption: 'Twenty',
      options: ['One', 'Five', 'Ten', 'Twenty'],
    },
    {
      id: 'en-d5',
      promptAudioText: 'friend',
      hintVi: 'Người bạn (/frend/)',
      hintEn: 'Someone close to you (/frend/)',
      correctOption: 'Friend',
      options: ['Home', 'Friend', 'Book', 'Coffee'],
    },
    {
      id: 'en-d6',
      promptAudioText: 'coffee',
      hintVi: 'Đồ uống quán cà phê',
      hintEn: 'Café drink',
      correctOption: 'Coffee',
      options: ['Coffee', 'Rice', 'Name', 'Happy'],
    },
  ];
}
