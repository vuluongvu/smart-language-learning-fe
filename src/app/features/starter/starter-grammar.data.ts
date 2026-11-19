import type { LearningLanguageCode } from '../../shared/types/learning-language.types';

export type StarterGrammarCategory = 'order' | 'particles' | 'verbs';

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
}

export interface StarterGrammarQuestion {
  id: string;
  grammarId: string;
  promptVi: string;
  promptEn: string;
  stem: string;
  correctOption: string;
  options: string[];
  completedSentence: string;
  explanationVi: string;
  explanationEn: string;
}

export const EN_STARTER_GRAMMAR_POINTS: StarterGrammarPoint[] = [
  {
    id: 'en-g1',
    category: 'order',
    titleVi: '1. Trật tự câu chuẩn: S + V + O',
    titleEn: '1. Core Word Order: Subject + Verb + Object',
    formula: 'S (Chủ ngữ) + V (Động từ) + O (Tân ngữ)',
    explanationVi:
      'Tiếng Anh luôn giữ thứ tự Chủ ngữ → Động từ → Đối tượng, và hiếm khi lược bỏ chủ ngữ đứng đầu câu.',
    explanationEn:
      'English sentences almost always start with a clear Subject, followed by the Verb and Object.',
    rules: [
      { labelVi: 'Chủ ngữ (Ai)', labelEn: 'Subject (Who)', sample: 'I / She / We' },
      { labelVi: 'Động từ (Làm gì)', labelEn: 'Verb (Action)', sample: 'drink / read' },
      { labelVi: 'Tân ngữ (Cái gì)', labelEn: 'Object (What)', sample: 'water / a book' },
    ],
    examples: [
      {
        sentence: 'I drink water every morning.',
        reading: '/aɪ drɪŋk ˈwɔːtər ˈevri ˈmɔːrnɪŋ/',
        meaningVi: 'Tôi uống nước mỗi sáng.',
        meaningEn: 'I drink water every morning.',
      },
      {
        sentence: 'They read English books.',
        reading: '/ðeɪ riːd ˈɪŋɡlɪʃ bʊks/',
        meaningVi: 'Họ đọc sách tiếng Anh.',
        meaningEn: 'They read English books.',
      },
    ],
    mistake: 'Every day drink coffee.',
    correction: 'I drink coffee every day.',
    mistakeNoteVi: 'Đừng quên chủ ngữ "I" trước động từ "drink".',
    mistakeNoteEn: 'Keep the subject "I" before the verb "drink".',
    aiPromptVi:
      'Cho mình 3 câu đơn giản theo cấu trúc S + V + O ở trình độ A0 kèm nghĩa tiếng Việt.',
    aiPromptEn: 'Give me 3 simple A0 examples using Subject + Verb + Object word order.',
  },
  {
    id: 'en-g2',
    category: 'verbs',
    titleVi: '2. Động từ "to be": am / is / are',
    titleEn: '2. Verb "to be": am / is / are',
    formula: 'I am · He/She/It is · You/We/They are',
    explanationVi:
      'Dùng để giới thiệu tên, nghề nghiệp, cảm xúc hoặc vị trí. Bắt buộc có am/is/are trước tính từ hoặc danh từ.',
    explanationEn:
      'Use am/is/are to link a subject with a noun, feeling, or place. Never drop "to be" before adjectives.',
    rules: [
      { labelVi: 'Ngôi tôi (I)', labelEn: 'I', sample: 'I am happy.' },
      { labelVi: 'Số ít (He/She/It)', labelEn: 'He / She / It', sample: 'She is tired.' },
      { labelVi: 'Số nhiều / You', labelEn: 'You / We / They', sample: 'We are ready.' },
    ],
    examples: [
      {
        sentence: 'She is a new student.',
        reading: '/ʃiː ɪz ə njuː ˈstuːdnt/',
        meaningVi: 'Cô ấy là học sinh mới.',
        meaningEn: 'She is a new student.',
      },
      {
        sentence: 'We are at home today.',
        reading: '/wiː ɑːr æt hoʊm təˈdeɪ/',
        meaningVi: 'Hôm nay chúng tôi ở nhà.',
        meaningEn: 'We are at home today.',
      },
    ],
    mistake: 'I very happy today.',
    correction: 'I am very happy today.',
    mistakeNoteVi: 'Trước tính từ "happy" luôn phải có động từ "am".',
    mistakeNoteEn: 'Always insert "am" before adjectives like "happy".',
    aiPromptVi: 'Giải thích nhanh cách phân biệt am, is, are và phủ định với not cho người mới.',
    aiPromptEn: 'Explain am, is, and are plus negative forms simply for a beginner.',
  },
  {
    id: 'en-g3',
    category: 'verbs',
    titleVi: '3. Hiện tại đơn & thêm -s / -es',
    titleEn: '3. Present Simple & -s / -es Ending',
    formula: 'I/You/We/They + V · He/She/It + V-s/es',
    explanationVi:
      'Diễn tả thói quen hằng ngày hoặc sự thật. Riêng chủ ngữ số ít ngôi 3 (He/She/It/Tên riêng) phải thêm -s hoặc -es vào động từ.',
    explanationEn:
      'Describe daily habits and facts. Add -s or -es when the subject is He, She, It, or a single person.',
    rules: [
      { labelVi: 'I / You / We / They', labelEn: 'I / You / We / They', sample: 'like / study' },
      { labelVi: 'He / She / It', labelEn: 'He / She / It', sample: 'likes / studies' },
      { labelVi: 'Phủ định', labelEn: 'Negative', sample: "don't / doesn't + V" },
    ],
    examples: [
      {
        sentence: 'He likes hot tea.',
        reading: '/hiː laɪks hɑːt tiː/',
        meaningVi: 'Anh ấy thích trà nóng.',
        meaningEn: 'He likes hot tea.',
      },
      {
        sentence: "She doesn't eat spicy food.",
        reading: '/ʃiː ˈdʌznt iːt ˈspaɪsi fuːd/',
        meaningVi: 'Cô ấy không ăn đồ cay.',
        meaningEn: "She doesn't eat spicy food.",
      },
    ],
    mistake: 'He work near my home.',
    correction: 'He works near my home.',
    mistakeNoteVi: 'Chủ ngữ "He" nên động từ cần thêm -s thành "works".',
    mistakeNoteEn: 'With "He", add -s to make "works".',
    aiPromptVi: 'Khi nào thêm -s và khi nào thêm -es ở thì hiện tại đơn? Cho ví dụ dễ nhớ.',
    aiPromptEn: 'When do we add -s vs -es in Present Simple? Give easy examples.',
  },
  {
    id: 'en-g4',
    category: 'particles',
    titleVi: '4. Mạo từ a / an / the & Số nhiều -s',
    titleEn: '4. Articles a / an / the & Plural -s',
    formula: 'a + âm phụ âm · an + âm nguyên âm (u,e,o,a,i)',
    explanationVi:
      'Danh từ đếm được số ít không đứng trơ trọi một mình: dùng a/an khi nhắc chung lần đầu, dùng "the" khi cả hai đều biết rõ vật nào.',
    explanationEn:
      'Singular countable nouns need an article: "a/an" for general items, "the" for something specific both speakers know.',
    rules: [
      { labelVi: 'a (trước phụ âm)', labelEn: 'a + consonant sound', sample: 'a book, a pen' },
      { labelVi: 'an (trước nguyên âm)', labelEn: 'an + vowel sound', sample: 'an apple, an egg' },
      { labelVi: 'Số nhiều', labelEn: 'Plural noun', sample: 'two books, three cups' },
    ],
    examples: [
      {
        sentence: 'I have an apple and a pen.',
        reading: '/aɪ hæv æn ˈæpl ænd ə pen/',
        meaningVi: 'Tôi có một quả táo và một cây bút.',
        meaningEn: 'I have an apple and a pen.',
      },
      {
        sentence: 'Please open the window.',
        reading: '/pliːz ˈoʊpən ðə ˈwɪndoʊ/',
        meaningVi: 'Làm ơn mở cửa sổ ra nhé.',
        meaningEn: 'Please open the window.',
      },
    ],
    mistake: 'I eat a apple.',
    correction: 'I eat an apple.',
    mistakeNoteVi: '"apple" bắt đầu bằng nguyên âm nên phải dùng "an apple".',
    mistakeNoteEn: '"apple" starts with a vowel sound, so use "an apple".',
    aiPromptVi: 'Cho mình bài tập 3 câu nhỏ phân biệt a, an và the cho người mới học.',
    aiPromptEn: 'Give me a short 3-sentence exercise distinguishing a, an, and the.',
  },
  {
    id: 'en-g5',
    category: 'order',
    titleVi: '5. Chỉ vị trí & tồn tại: This/That · There is/are',
    titleEn: '5. Pointing & Existing: This/That & There is/are',
    formula: 'This is (gần) · That is (xa) · There is/are (Có...)',
    explanationVi:
      'Dùng This/That để chỉ vật đang nói tới, còn "There is / There are" dùng để nói "Có vật gì ở đâu đó" (khác với "I have" = tôi sở hữu).',
    explanationEn:
      'Use This/That to point at objects, and There is / There are to say something exists at a place.',
    rules: [
      { labelVi: 'Gần (1 / nhiều)', labelEn: 'Near', sample: 'This is / These are' },
      { labelVi: 'Xa (1 / nhiều)', labelEn: 'Far', sample: 'That is / Those are' },
      { labelVi: 'Có (số ít / nhiều)', labelEn: 'Exist', sample: 'There is / There are' },
    ],
    examples: [
      {
        sentence: 'This is my friend Minh.',
        reading: '/ðɪs ɪz maɪ frend mɪn/',
        meaningVi: 'Đây là bạn Minh của tôi.',
        meaningEn: 'This is my friend Minh.',
      },
      {
        sentence: 'There are two cups on the table.',
        reading: '/ðer ɑːr tuː kʌps ɑːn ðə ˈteɪbl/',
        meaningVi: 'Có hai cái cốc ở trên bàn.',
        meaningEn: 'There are two cups on the table.',
      },
    ],
    mistake: 'Have two chairs in the room.',
    correction: 'There are two chairs in the room.',
    mistakeNoteVi: 'Khi nói "Có ở đâu đó", dùng "There is / There are" thay vì "Have".',
    mistakeNoteEn: 'To state existence in a place, say "There are..." instead of "Have...".',
    aiPromptVi: 'Phân biệt nhanh "There is/are" và "have/has" với 3 ví dụ quen thuộc.',
    aiPromptEn: 'Contrast "There is/are" vs "have/has" with 3 everyday examples.',
  },
  {
    id: 'en-g6',
    category: 'verbs',
    titleVi: '6. Đặt câu hỏi cơ bản (Is/Are · Do/Does · Wh-)',
    titleEn: '6. Basic Questions (Is/Are · Do/Does · Wh-)',
    formula: '(Wh-) + am/is/are/do/does + S + ...?',
    explanationVi:
      'Để hỏi Yes/No, đảo trợ động từ (am/is/are hoặc do/does) lên trước chủ ngữ. Muốn hỏi thông tin cụ thể, đặt What / Where / When / How ở đầu.',
    explanationEn:
      'Move am/is/are or do/does before the subject for Yes/No questions, or place What/Where/When/How in front.',
    rules: [
      { labelVi: 'Hỏi với to be', labelEn: 'To be question', sample: 'Are you ready?' },
      { labelVi: 'Hỏi hành động', labelEn: 'Action question', sample: 'Do you like tea?' },
      { labelVi: 'Từ để hỏi', labelEn: 'Wh- words', sample: 'Where is / What do...' },
    ],
    examples: [
      {
        sentence: 'Do you speak English?',
        reading: '/duː juː spiːk ˈɪŋɡlɪʃ/',
        meaningVi: 'Bạn có nói tiếng Anh không?',
        meaningEn: 'Do you speak English?',
      },
      {
        sentence: 'Where is the train station?',
        reading: '/wer ɪz ðə treɪn ˈsteɪʃn/',
        meaningVi: 'Ga tàu ở đâu vậy?',
        meaningEn: 'Where is the train station?',
      },
    ],
    mistake: 'Where you live?',
    correction: 'Where do you live?',
    mistakeNoteVi: 'Câu hỏi động từ thường "live" cần mượn "do" trước chủ ngữ "you".',
    mistakeNoteEn: 'Action verbs like "live" need helper "do" before "you".',
    aiPromptVi: 'Hướng dẫn mình 5 câu hỏi giao tiếp đơn giản dùng Do you / Are you / Where is.',
    aiPromptEn: 'Teach me 5 useful beginner questions with Do you, Are you, and Where is.',
  },
];

export const KO_STARTER_GRAMMAR_POINTS: StarterGrammarPoint[] = [
  {
    id: 'ko-g1',
    category: 'order',
    titleVi: '1. Trật tự câu tiếng Hàn: S + O + V (Động từ cuối câu)',
    titleEn: '1. Korean Sentence Order: S + O + V (Verb Last)',
    formula: 'Chủ ngữ + Tân ngữ / Nơi chốn + Động từ (ở cuối)',
    explanationVi:
      'Khác với tiếng Việt và tiếng Anh, động từ hoặc tính từ tiếng Hàn LUÔN nằm ở cuối câu. Các tiểu từ gắn vào danh từ để báo hiệu vai trò trong câu.',
    explanationEn:
      'Unlike English, Korean verbs and adjectives ALWAYS come at the end of the sentence, while particles mark each noun.',
    rules: [
      { labelVi: '1. Chủ ngữ', labelEn: '1. Subject', sample: '저는 (tôi)' },
      { labelVi: '2. Tân ngữ', labelEn: '2. Object', sample: '커피를 (cà phê)' },
      { labelVi: '3. Động từ cuối', labelEn: '3. Verb last', sample: '마셔요 (uống)' },
    ],
    examples: [
      {
        sentence: '저는 커피를 마셔요.',
        reading: 'jeo-neun keo-pi-reul ma-syeo-yo',
        meaningVi: 'Tôi uống cà phê.',
        meaningEn: 'I drink coffee.',
      },
      {
        sentence: '친구가 한국어를 공부해요.',
        reading: 'chin-gu-ga han-gu-geo-reul gong-bu-hae-yo',
        meaningVi: 'Bạn tôi học tiếng Hàn.',
        meaningEn: 'My friend studies Korean.',
      },
    ],
    mistake: '저는 마셔요 물.',
    correction: '저는 물을 마셔요.',
    mistakeNoteVi: 'Động từ "마셔요" phải đặt ở cuối câu sau tân ngữ "물을".',
    mistakeNoteEn: 'Move the verb "마셔요" to the very end after "물을".',
    aiPromptVi:
      'Giải thích quy tắc S + O + V tiếng Hàn cho người Việt mới học và cho 3 câu ngắn dễ thuộc.',
    aiPromptEn: 'Explain Korean S + O + V word order with 3 easy A0 examples.',
  },
  {
    id: 'ko-g2',
    category: 'particles',
    titleVi: '2. Câu khẳng định "Là ...": -이에요 / -예요',
    titleEn: '2. Polite "Am / Is / Are + Noun": -이에요 / -예요',
    formula: 'Có batchim + 이에요 · Không batchim + 예요',
    explanationVi:
      'Gắn ngay sau danh từ (không cách khoảng) để nói "là ...". Nhìn âm tiết cuối của danh từ: có phụ âm đáy (batchim) dùng -이에요, không có dùng -예요.',
    explanationEn:
      'Attach directly to nouns meaning "am/is/are [noun]". Use -이에요 if the noun ends in a batchim, -예요 if it ends in a vowel.',
    rules: [
      { labelVi: 'Có batchim (ㅇ/ㄱ/ㄴ...)', labelEn: 'Final consonant', sample: '학생 + 이에요' },
      { labelVi: 'Không batchim', labelEn: 'Vowel ending', sample: '커피 + 예요' },
      { labelVi: 'Hỏi lịch sự', labelEn: 'Question', sample: 'Lên giọng cuối câu?' },
    ],
    examples: [
      {
        sentence: '저는 학생이에요.',
        reading: 'jeo-neun hak-saeng-i-e-yo',
        meaningVi: 'Tôi là học sinh / sinh viên.',
        meaningEn: 'I am a student.',
      },
      {
        sentence: '이것은 우유예요.',
        reading: 'i-geo-seun u-yu-ye-yo',
        meaningVi: 'Cái này là sữa.',
        meaningEn: 'This is milk.',
      },
    ],
    mistake: '저는 의사이에요.',
    correction: '저는 의사예요.',
    mistakeNoteVi: 'Chữ "사" không có âm cuối batchim nên phải dùng "-예요".',
    mistakeNoteEn: '"사" ends in a vowel without batchim, so attach "-예요".',
    aiPromptVi: 'Cho mình 4 ví dụ tự giới thiệu tên, quốc tịch, nghề nghiệp dùng -이에요/예요.',
    aiPromptEn: 'Give me 4 self-introduction examples using -이에요 and -예요.',
  },
  {
    id: 'ko-g3',
    category: 'particles',
    titleVi: '3. Tiểu từ chủ ngữ / chủ đề: -은/는 và -이/가',
    titleEn: '3. Topic & Subject Particles: -은/는 vs -이/가',
    formula: 'Có batchim: 은 / 이 · Không batchim: 는 / 가',
    explanationVi:
      '-은/는 nêu chủ đề câu ("Về phần X thì...") hoặc so sánh; -이/가 nhấn mạnh đúng chủ thể làm hành động hoặc giới thiệu thông tin mới.',
    explanationEn:
      '-은/는 marks the sentence topic or contrast ("As for X..."), while -이/가 spotlights the grammatical subject or new info.',
    rules: [
      { labelVi: 'Chủ đề (Batchim / Không)', labelEn: 'Topic', sample: '이름은 / 저는' },
      { labelVi: 'Chủ thể (Batchim / Không)', labelEn: 'Subject', sample: '물이 / 날씨가' },
    ],
    examples: [
      {
        sentence: '저는 베트남 사람이에요.',
        reading: 'jeo-neun be-teu-nam sa-ram-i-e-yo',
        meaningVi: 'Tôi là người Việt Nam.',
        meaningEn: 'I am Vietnamese.',
      },
      {
        sentence: '오늘 날씨가 좋아요.',
        reading: 'o-neul nal-ssi-ga jo-a-yo',
        meaningVi: 'Hôm nay thời tiết đẹp.',
        meaningEn: 'The weather is nice today.',
      },
    ],
    mistake: '저가 한국어 공부해요.',
    correction: '제가 한국어를 공부해요.',
    mistakeNoteVi: 'Khi "저" đi với "-가" luôn biến thành "제가" (không viết 저가).',
    mistakeNoteEn: '"저 + 가" always contracts into "제가".',
    aiPromptVi: 'Khi nào người Hàn hay dùng -은/는 và khi nào dùng -이/가? Nói thật dễ hiểu.',
    aiPromptEn: 'When do Koreans use -은/는 vs -이/가 in simple beginner terms?',
  },
  {
    id: 'ko-g4',
    category: 'particles',
    titleVi: '4. Tân ngữ (-을/를) & Địa điểm (-에 / -에서)',
    titleEn: '4. Object (-을/를) & Location (-에 vs -에서)',
    formula: 'Tân ngữ: 을(batchim)/를 · Ở yên/Đi tới: 에 · Hành động tại: 에서',
    explanationVi:
      '-을/를 gắn sau đối tượng chịu tác động của động từ (ăn cơm, mua túi). -에 đi với 가다/오다/있다 (đến/có ở), còn -에서 dùng nơi xảy ra hành động.',
    explanationEn:
      '-을/를 marks direct objects. Use -에 for destination or static existence (go/be), and -에서 where an active verb takes place.',
    rules: [
      { labelVi: 'Tân ngữ', labelEn: 'Direct Object', sample: '밥을 / 사과를' },
      {
        labelVi: 'Đích đến / Có mặt',
        labelEn: 'Destination / State',
        sample: '집에 가요 / 있어요',
      },
      { labelVi: 'Nơi làm hành động', labelEn: 'Action location', sample: '카페에서 마셔요' },
    ],
    examples: [
      {
        sentence: '사과를 먹어요.',
        reading: 'sa-gwa-reul meo-geo-yo',
        meaningVi: 'Tôi ăn táo.',
        meaningEn: 'I eat an apple.',
      },
      {
        sentence: '집에 가요 · 카페에서 공부해요.',
        reading: 'ji-be ga-yo · ka-pe-e-seo gong-bu-hae-yo',
        meaningVi: 'Về nhà · Học bài ở quán cà phê.',
        meaningEn: 'Go home · Study at a cafe.',
      },
    ],
    mistake: '도서관에 공부해요.',
    correction: '도서관에서 공부해요.',
    mistakeNoteVi: '"공부하다" (học) là hành động diễn ra tại thư viện nên phải dùng "에서".',
    mistakeNoteEn: 'Studying is an active action at the library, so use "-에서".',
    aiPromptVi: 'Phân biệt nhanh -에 và -에서 bằng 3 cặp câu đối chiếu ngắn.',
    aiPromptEn: 'Compare Korean -에 vs -에서 with 3 clear contrastive examples.',
  },
  {
    id: 'ko-g5',
    category: 'verbs',
    titleVi: '5. Chia đuôi lịch sự thân mật: -아요 / -어요 / -해요',
    titleEn: '5. Polite Present Verb Ending: -아요 / -어요 / -해요',
    formula: 'Nguyên âm ㅏ,ㅗ → +아요 · Khác → +어요 · 하다 → 해요',
    explanationVi:
      'Bỏ chữ 다 ở gốc động từ, nhìn nguyên âm cuối cùng của gốc: sáng (ㅏ, ㅗ) cộng 아요; tối (ㅓ, ㅜ, ㅣ, ㅡ) cộng 어요; đuôi 하다 đổi ngay thành 해요.',
    explanationEn:
      'Drop -다 from dictionary verbs: bright vowels (ㅏ, ㅗ) take -아요, others take -어요, and -하다 becomes -해요.',
    rules: [
      { labelVi: 'Chứa ㅏ / ㅗ', labelEn: 'ㅏ / ㅗ vowel', sample: '가다 → 가요 · 오다 → 와요' },
      {
        labelVi: 'Nguyên âm khác',
        labelEn: 'Other vowels',
        sample: '먹다 → 먹어요 · 마시다 → 마셔요',
      },
      { labelVi: 'Đuôi 하다', labelEn: '-하다 verbs', sample: '공부하다 → 공부해요' },
    ],
    examples: [
      {
        sentence: '매일 한국어를 공부해요.',
        reading: 'mae-il han-gu-geo-reul gong-bu-hae-yo',
        meaningVi: 'Mỗi ngày tôi đều học tiếng Hàn.',
        meaningEn: 'I study Korean every day.',
      },
      {
        sentence: '오늘 집에 와요.',
        reading: 'o-neul ji-be wa-yo',
        meaningVi: 'Hôm nay tôi về/tới nhà.',
        meaningEn: 'I come home today.',
      },
    ],
    mistake: '저는 밥을 먹아요.',
    correction: '저는 밥을 먹어요.',
    mistakeNoteVi: 'Gốc "먹-" chứa nguyên âm ㅓ (không phải ㅏ/ㅗ) nên chia thành "먹어요".',
    mistakeNoteEn: 'Stem "먹-" has vowel ㅓ, so attach "-어요" → "먹어요".',
    aiPromptVi:
      'Cho mình bảng tóm tắt chia 6 động từ thông dụng (가다, 오다, 먹다, 마시다, 보다, 하다).',
    aiPromptEn: 'Conjugate 6 common Korean verbs into -아요/-어요/-해요 with Romanization.',
  },
  {
    id: 'ko-g6',
    category: 'verbs',
    titleVi: '6. Phủ định (안 + V) & Gọi món lịch sự (-주세요)',
    titleEn: '6. Easy Negation (안 + V) & Polite Requests (-주세요)',
    formula: '안 + Động từ (Không...) · Danh từ + 주세요 (Làm ơn cho...)',
    explanationVi:
      'Đặt "안" ngay trước động từ để phủ định (với từ ghép "-하다" đặt vào giữa: 공부 안 해요). Dùng "주세요" để gọi món hoặc nhờ vả lịch sự.',
    explanationEn:
      'Place "안" right before a verb (or before 해요 in noun+하다 verbs) to negate. Add "주세요" after any noun to request politely.',
    rules: [
      { labelVi: 'Phủ định thường', labelEn: 'Standard negation', sample: '안 가요 · 안 먹어요' },
      { labelVi: 'Động từ 하다', labelEn: '-하다 negation', sample: '운동 안 해요' },
      { labelVi: 'Gọi món / Xin', labelEn: 'Polite request', sample: '물 주세요' },
    ],
    examples: [
      {
        sentence: '따뜻한 커피 한 잔 주세요.',
        reading: 'tta-tteu-tan keo-pi han jan ju-se-yo',
        meaningVi: 'Làm ơn cho một ly cà phê nóng.',
        meaningEn: 'One cup of warm coffee, please.',
      },
      {
        sentence: '저는 매운 음식을 안 먹어요.',
        reading: 'jeo-neun mae-un eum-si-geul an meo-geo-yo',
        meaningVi: 'Tôi không ăn đồ cay.',
        meaningEn: "I don't eat spicy food.",
      },
    ],
    mistake: '안 공부해요.',
    correction: '공부 안 해요.',
    mistakeNoteVi: 'Với động từ dạng [Danh từ + 하다], luôn đặt "안" trước "해요".',
    mistakeNoteEn: 'For [Noun + 하다] verbs, place "안" right before "해요".',
    aiPromptVi: 'Dạy mình 3 mẫu câu gọi đồ ăn và nói không thích gì bằng tiếng Hàn A0.',
    aiPromptEn: 'Teach me 3 A0 Korean phrases for ordering food and politely saying no.',
  },
];

export const EN_STARTER_GRAMMAR_QUIZ: StarterGrammarQuestion[] = [
  {
    id: 'en-gq1',
    grammarId: 'en-g2',
    promptVi: 'Chọn dạng đúng của động từ "to be" cho chủ ngữ "She":',
    promptEn: 'Pick the correct "to be" form for "She":',
    stem: 'She ___ my English teacher.',
    correctOption: 'is',
    options: ['am', 'is', 'are', 'be'],
    completedSentence: 'She is my English teacher.',
    explanationVi: 'Chủ ngữ ngôi 3 số ít (He / She / It) luôn đi với "is".',
    explanationEn: 'Third-person singular subjects (He / She / It) always take "is".',
  },
  {
    id: 'en-gq2',
    grammarId: 'en-g3',
    promptVi: 'Chia động từ Hiện tại đơn phù hợp với "Minh" (1 người):',
    promptEn: 'Choose the Present Simple verb for "Minh":',
    stem: 'Minh ___ coffee every morning.',
    correctOption: 'drinks',
    options: ['drink', 'drinks', 'drinking', 'is drink'],
    completedSentence: 'Minh drinks coffee every morning.',
    explanationVi: 'Chủ ngữ số ít "Minh" tương đương "He", nên động từ thêm -s thành "drinks".',
    explanationEn: '"Minh" is third-person singular, so add -s to form "drinks".',
  },
  {
    id: 'en-gq3',
    grammarId: 'en-g4',
    promptVi: 'Điền mạo từ đúng trước danh từ "apple":',
    promptEn: 'Pick the right article before "apple":',
    stem: 'I eat ___ apple after lunch.',
    correctOption: 'an',
    options: ['a', 'an', 'many', 'two'],
    completedSentence: 'I eat an apple after lunch.',
    explanationVi: '"apple" bắt đầu bằng âm nguyên âm /æ/ nên dùng "an".',
    explanationEn: '"apple" begins with a vowel sound, so use "an".',
  },
  {
    id: 'en-gq4',
    grammarId: 'en-g1',
    promptVi: 'Chọn câu có trật tự chuẩn tiếng Anh (S + V + O):',
    promptEn: 'Pick the sentence with standard English S + V + O order:',
    stem: 'Which sentence is natural?',
    correctOption: 'We read a book together.',
    options: [
      'Read we a book together.',
      'We read a book together.',
      'A book we together read.',
      'Read a book together.',
    ],
    completedSentence: 'We read a book together.',
    explanationVi: 'Trật tự chuẩn là Chủ ngữ (We) + Động từ (read) + Tân ngữ (a book).',
    explanationEn: 'Standard English follows Subject (We) + Verb (read) + Object (a book).',
  },
  {
    id: 'en-gq5',
    grammarId: 'en-g5',
    promptVi: 'Chọn cấu trúc đúng khi nói "Có một cây bút trên bàn":',
    promptEn: 'Complete the sentence saying one pen exists on the table:',
    stem: '___ a pen on the desk.',
    correctOption: 'There is',
    options: ['Have', 'There are', 'There is', 'They are'],
    completedSentence: 'There is a pen on the desk.',
    explanationVi: 'Chỉ có 1 cây bút ("a pen" số ít) nên dùng "There is".',
    explanationEn: '"a pen" is singular, so say "There is".',
  },
  {
    id: 'en-gq6',
    grammarId: 'en-g6',
    promptVi: 'Chọn trợ động từ đúng để tạo câu hỏi Hiện tại đơn:',
    promptEn: 'Pick the helper verb to form a Present Simple question:',
    stem: '___ you like Korean food?',
    correctOption: 'Do',
    options: ['Are', 'Is', 'Do', 'Does'],
    completedSentence: 'Do you like Korean food?',
    explanationVi: '"like" là động từ thường và chủ ngữ là "you" nên mượn "Do" đứng đầu câu.',
    explanationEn: 'Action verb "like" with subject "you" takes helper "Do".',
  },
];

export const KO_STARTER_GRAMMAR_QUIZ: StarterGrammarQuestion[] = [
  {
    id: 'ko-gq1',
    grammarId: 'ko-g2',
    promptVi: 'Chọn đuôi phù hợp cho danh từ có batchim "학생" (học sinh):',
    promptEn: 'Pick the right ending for "학생" (ends with batchim ㅇ):',
    stem: '저는 학생___.',
    correctOption: '이에요',
    options: ['이에요', '예요', '가', '를'],
    completedSentence: '저는 학생이에요.',
    explanationVi: '"생" có âm cuối ㅇ (có batchim) nên gắn ngay sau là "-이에요".',
    explanationEn: '"생" ends with batchim ㅇ, so attach "-이에요".',
  },
  {
    id: 'ko-gq2',
    grammarId: 'ko-g2',
    promptVi: 'Chọn đuôi cho danh từ không có batchim "우유" (sữa):',
    promptEn: 'Pick the ending for "우유" (ends in vowel ㅠ):',
    stem: '이것은 우유___.',
    correctOption: '예요',
    options: ['이에요', '예요', '은', '을'],
    completedSentence: '이것은 우유예요.',
    explanationVi: '"유" kết thúc bằng nguyên âm (không có batchim) nên dùng "-예요".',
    explanationEn: '"유" has no final batchim, so use "-예요".',
  },
  {
    id: 'ko-gq3',
    grammarId: 'ko-g4',
    promptVi: 'Điền tiểu từ tân ngữ đúng cho "물" (có batchim ㄹ):',
    promptEn: 'Choose the object particle for "물" (batchim ㄹ):',
    stem: '저는 물___ 마셔요.',
    correctOption: '을',
    options: ['을', '를', '에', '는'],
    completedSentence: '저는 물을 마셔요.',
    explanationVi: '"물" có phụ âm đáy ㄹ nên đi với tiểu từ tân ngữ "-을".',
    explanationEn: '"물" has batchim ㄹ, so attach object particle "-을".',
  },
  {
    id: 'ko-gq4',
    grammarId: 'ko-g4',
    promptVi: 'Chọn tiểu từ đúng khi thực hiện hành động "học bài" tại thư viện:',
    promptEn: 'Choose the particle where an action ("study") takes place:',
    stem: '도서관___ 한국어를 공부해요.',
    correctOption: '에서',
    options: ['에', '에서', '를', '는'],
    completedSentence: '도서관에서 한국어를 공부해요.',
    explanationVi: 'Nơi diễn ra hành động ("공부해요") luôn dùng tiểu từ "-에서".',
    explanationEn: 'Use "-에서" to mark the place where an active verb happens.',
  },
  {
    id: 'ko-gq5',
    grammarId: 'ko-g5',
    promptVi: 'Chia động từ "먹다" (ăn, chứa nguyên âm ㅓ) sang đuôi lịch sự:',
    promptEn: 'Conjugate "먹다" (vowel ㅓ) into the polite present ending:',
    stem: '지금 사과를 ___.',
    correctOption: '먹어요',
    options: ['먹아요', '먹어요', '먹해요', '먹다요'],
    completedSentence: '지금 사과를 먹어요.',
    explanationVi: 'Gốc "먹-" chứa nguyên âm ㅓ (không phải ㅏ/ㅗ) nên cộng "-어요" → "먹어요".',
    explanationEn: 'Stem "먹-" has vowel ㅓ, so attach "-어요" → "먹어요".',
  },
  {
    id: 'ko-gq6',
    grammarId: 'ko-g6',
    promptVi: 'Chọn cách nói đúng cho "Hôm nay không tập thể dục (운동하다)":',
    promptEn: 'Pick the natural negation for "운동하다" (to exercise):',
    stem: '오늘 ___.',
    correctOption: '운동 안 해요',
    options: ['안 운동해요', '운동 안 해요', '운동해요 안', '안 운동에요'],
    completedSentence: '오늘 운동 안 해요.',
    explanationVi: 'Động từ dạng [Danh từ + 하다] luôn chèn "안" vào giữa trước "해요".',
    explanationEn: 'Split [Noun + 하다] verbs by putting "안" right before "해요".',
  },
];

export function buildStarterGrammarPoints(lang: LearningLanguageCode): StarterGrammarPoint[] {
  return lang === 'ko' ? KO_STARTER_GRAMMAR_POINTS : EN_STARTER_GRAMMAR_POINTS;
}

export function buildStarterGrammarQuiz(lang: LearningLanguageCode): StarterGrammarQuestion[] {
  return lang === 'ko' ? KO_STARTER_GRAMMAR_QUIZ : EN_STARTER_GRAMMAR_QUIZ;
}
