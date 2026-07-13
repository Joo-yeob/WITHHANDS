export const RARITY_CONFIG = {
  Common: {
    label: '일반',
    color: '#8B9DAF',
    bg: 'linear-gradient(135deg, #C8D6E5, #8B9DAF)',
    bgClass: 'from-slate-300 to-slate-400',
    stars: 1,
  },
  Uncommon: {
    label: '고급',
    color: '#4CAF50',
    bg: 'linear-gradient(135deg, #A8E6CF, #4CAF50)',
    bgClass: 'from-green-200 to-green-500',
    stars: 2,
  },
  Rare: {
    label: '희귀',
    color: '#2196F3',
    bg: 'linear-gradient(135deg, #90CAF9, #2196F3)',
    bgClass: 'from-blue-200 to-blue-500',
    stars: 3,
  },
  Epic: {
    label: '영웅',
    color: '#9C27B0',
    bg: 'linear-gradient(135deg, #CE93D8, #9C27B0)',
    bgClass: 'from-purple-200 to-purple-600',
    stars: 4,
  },
  Legendary: {
    label: '전설',
    color: '#FF9800',
    bg: 'linear-gradient(135deg, #FFE082, #FF9800)',
    bgClass: 'from-amber-200 to-amber-500',
    stars: 5,
  },
};

export const TYPE_ICONS = {
  '불': '◆', '물': '◇', '자연': '❧', '전기': '◈', '아늑함': '◯',
  '집중': '◉', '밤': '◐', '사교': '◇', '음악': '♪', '음식': '◈',
  '모험': '✦', '창의': '✧', '기술': '▣', '스포츠': '◈', '사랑': '❖',
  '공부': '▤', '도시': '▦', '신비': '✧', '바람': '〜', '빛': '✦',
  '그림자': '◐', '얼음': '❅', '대화': '◇', '심야': '☾',
};

export function getTypeIcon(type) {
  return TYPE_ICONS[type] || '✦';
}

export function getRarityConfig(rarity) {
  return RARITY_CONFIG[rarity] || RARITY_CONFIG.Common;
}

export function getRarityLabel(rarity) {
  return RARITY_CONFIG[rarity]?.label || rarity;
}

export function formatDate(dateStr) {
  if (!dateStr) return '알 수 없음';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}