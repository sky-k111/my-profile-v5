export type PhotoId = `photo-${'01' | '04' | '05' | '06' | '07' | '08' | '09' | '10'}`;

type PhotoBase = {
  id: PhotoId;
  ratio: '4/5' | '3/4' | '4/3' | '16/9' | '2/3' | '1/1' | '3/2' | '16/10';
  objectPosition?: string;
};

type EmptyPhoto = PhotoBase & {
  src?: undefined;
  altZh?: never;
  altEn?: never;
};

type PopulatedPhoto = PhotoBase & {
  src: string;
  altZh: string;
  altEn?: string;
};

export type AboutPhoto = EmptyPhoto | PopulatedPhoto;

export type AboutContent = {
  nameEn: string;
  nameZh: string;
  identityEn: string;
  identityZh: string;
  metadataZh: string;
  metadataEn: string;
  biographyZh: string[];
  biographyEn: string[];
  biographyTypeEn: string[];
  aiTitle: string[];
  aiZh: string;
  growthZh: string;
  aiEn: string;
  growthEn: string;
  interests: ReadonlyArray<{
    index: string;
    title: string;
    accent: string;
    meta: string;
    copyZh: string;
  }>;
  manifestoEn: string;
  manifestoZh: string;
};

export const ABOUT_CONTENT: AboutContent = {
  nameEn: 'CHEN YIKAI',
  nameZh: '陈奕恺',
  identityEn: 'BETWEEN CODE, CURIOSITY AND LIFE.',
  identityZh: '在代码、好奇心与生活之间，持续创造新的可能。',
  metadataZh: '杭州 · 天蝎座 · ESFJ',
  metadataEn: 'Based in Hangzhou · Scorpio · ESFJ',
  biographyZh: [
    '我叫陈奕恺，就读于浙江工商大学计算机科学与技术专业。',
    '我自信、开朗，享受人与人之间真实的连接，也乐于把新的想法变成能够被看见、被体验的作品。对我而言，技术不只是冰冷的代码，更是一种理解问题、表达想法和创造可能的方式。',
  ],
  biographyEn: [
    'I’m Chen Yikai, a Computer Science and Technology student at Zhejiang Gongshang University.',
    'Confident, outgoing and always open to new connections, I enjoy turning ideas into experiences that can be seen, felt and shared. To me, technology is more than code: it is a way to understand problems, express ideas and create new possibilities.',
  ],
  biographyTypeEn: [
    'I LEARN BY MAKING.',
    'I CONNECT BY SHARING.',
    'I KEEP MOVING.',
  ],
  aiTitle: ['AUGMENTED BY INTELLIGENCE.', 'DRIVEN BY CURIOSITY.'],
  aiZh: '我喜欢将人工智能（Artificial Intelligence，AI）带入日常生活：用它拆解复杂问题、拓展思考边界，也让零散的灵感逐渐成为真正落地的项目。',
  growthZh: '我仍在不断学习，不断刷新自己的能力边界。成长对我而言并不是抵达某个终点，而是始终保持探索、行动和更新。',
  aiEn: 'I bring Artificial Intelligence into both everyday life and creative work, using it to navigate complexity, expand ideas and transform fragments of inspiration into meaningful projects.',
  growthEn: 'I’m still learning, building and evolving. Growth is not a destination, but a continuous process of curiosity, action and renewal.',
  interests: [
    { index: '01', title: 'MUSIC', accent: 'RESONANCE', meta: 'SOUND / EMOTION', copyZh: '音乐让难以言说的情绪拥有共鸣。' },
    { index: '02', title: 'FILM', accent: 'PERSPECTIVE', meta: 'FRAME / STORY', copyZh: '在别人的故事里，重新理解自己。' },
    { index: '03', title: 'SPORT', accent: 'MOMENTUM', meta: 'BODY / MOTION', copyZh: '持续向前，本身就是一种力量。' },
    { index: '04', title: 'EVERYTHING INTERESTING', accent: 'CURIOSITY', meta: 'UNKNOWN / ∞', copyZh: '对一切鲜活的事物和未知保留期待。' },
  ],
  manifestoEn: 'STAY PASSIONATE. KEEP MOVING FORWARD.',
  manifestoZh: '保持热爱，永远向前。',
};

export const ABOUT_PHOTOS: readonly AboutPhoto[] = [
  { id: 'photo-01', ratio: '4/5', src: '/images/about/formal.png', altZh: '身着黑色礼服和领结的正式肖像', objectPosition: '50% 40%' },
  { id: 'photo-04', ratio: '16/9', src: '/images/about/blue-sky.jpg', altZh: '蓝天下仰拍的人像', objectPosition: '42% 48%' },
  { id: 'photo-05', ratio: '4/5', src: '/images/about/headphones.jpg', altZh: '戴着耳机和白色帽子的侧脸', objectPosition: '50% 44%' },
  { id: 'photo-06', ratio: '4/3', src: '/images/about/cap-headphones.jpg', altZh: '戴白色帽子与耳机的近景自拍', objectPosition: '58% 100%' },
  { id: 'photo-07', ratio: '3/2', src: '/images/about/classroom.jpg', altZh: '教室里穿白色上衣的自拍', objectPosition: '56% 46%' },
  { id: 'photo-08', ratio: '16/10', src: '/images/about/beach.jpg', altZh: '海边蓝天下的自拍', objectPosition: '50% 46%' },
  { id: 'photo-09', ratio: '3/4', src: '/images/about/track.jpg', altZh: '田径场起跑器旁的全身照', objectPosition: '50% 50%' },
  { id: 'photo-10', ratio: '3/2', src: '/images/about/red-rail.jpg', altZh: '倚靠红色栏杆的侧面人像', objectPosition: '56% 80%' },
] as const;
