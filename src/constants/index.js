// ============================================
// PLANS - Uygulama Sabitleri
// ============================================

// Marka Sabitleri
export const APP_NAME = 'Plans';
export const APP_VERSION = '1.0.0';

// Tema Sabitleri
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light'
};

export const THEME_COLORS = {
  dark: {
    bg: 'bg-dark-900',
    bgSecondary: 'bg-dark-800',
    bgCard: 'bg-dark-800/60',
    text: 'text-white',
    textSecondary: 'text-dark-400',
    border: 'border-dark-700/50',
    accent: 'gold'
  },
  light: {
    bg: 'bg-gray-50',
    bgSecondary: 'bg-white',
    bgCard: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    border: 'border-gray-200',
    accent: 'gold'
  }
};

// Katılım Durumları (Bakarız kaldırıldı)
export const KATILIM_DURUMLARI = {
  VARIM: 'varim',
  YOKUM: 'yokum'
};

export const KATILIM_LABELS = {
  varim: 'Varım',
  yokum: 'Yokum'
};

export const KATILIM_COLORS = {
  varim: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    solid: 'bg-emerald-500'
  },
  yokum: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    solid: 'bg-red-500'
  }
};

// Plan Türleri
export const PLAN_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private'
};

export const PLAN_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

// Profil Gizlilik Ayarları
export const PROFILE_PRIVACY = {
  PUBLIC: 'public',
  PRIVATE: 'private'
};

// Müsaitlik Durumları
export const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy'
};

// Konum Yarıçap Seçenekleri (km)
export const LOCATION_RADIUS_OPTIONS = [
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 80, label: '80 km' }
];

// Katılımcı Limitleri
export const PARTICIPANT_LIMITS = [
  { value: 0, label: 'Limitsiz' },
  { value: 3, label: '3 kişi' },
  { value: 5, label: '5 kişi' },
  { value: 8, label: '8 kişi' },
  { value: 10, label: '10 kişi' },
  { value: 15, label: '15 kişi' }
];

// Avatar Kategorileri
export const AVATAR_CATEGORIES = {
  erkek: ['👨', '👨‍🦱', '👨‍🦰', '👨‍🦳', '🧔', '👱‍♂️', '👨‍🎓', '👨‍💼', '🤵', '👲'],
  kadin: ['👩', '👩‍🦱', '👩‍🦰', '👩‍🦳', '👱‍♀️', '👩‍🎓', '👩‍💼', '👰', '🧕', '👧'],
  fantastik: ['🤖', '👽', '👻', '🦊', '🐱', '🐶', '🦁', '🐼', '🦄', '🐲']
};

// Grup İkonları
export const GROUP_ICONS = ['🎓', '💼', '⚽', '🎮', '🎵', '🍕', '☕', '🎬', '🏖️', '🎉'];

// Saat Seçenekleri
export const HOUR_OPTIONS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
  '21:00', '22:00'
];

// Gün İsimleri
export const DAY_NAMES = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

// Ay İsimleri
export const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Bildirim Türleri
export const NOTIFICATION_TYPES = {
  ARKADAS_ISTEGI: 'arkadas_istegi',
  ARKADAS_KABUL: 'arkadas_kabul',
  YENI_MESAJ: 'yeni_mesaj',
  HIKAYE_IZLENDI: 'hikaye_izlendi',
  HIKAYE_TEPKI: 'hikaye_tepki',
  PLAN_DAVET: 'plan_davet',
  PLAN_GUNCELLEME: 'plan_guncelleme',
  PLAN_YORUM: 'plan_yorum',
  PLAN_KATILIM_ISTEGI: 'plan_katilim_istegi',
  PLAN_KATILIM_ONAY: 'plan_katilim_onay',
  PLAN_KATILIM_RED: 'plan_katilim_red'
};

// Storage Keys
export const STORAGE_KEYS = {
  THEME: 'plans_theme',
  USER_LOCATION: 'plans_user_location',
  LOCATION_RADIUS: 'plans_location_radius'
};

// Kullanıcı Adı Kuralları
export const USERNAME_RULES = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
  PATTERN: /^[a-z0-9_]+$/,
  FORBIDDEN_WORDS: ['admin', 'plans', 'support', 'help', 'official', 'moderator', 'mod']
};

// Maximum Görüntülenecek Katılımcı Sayısı
export const MAX_VISIBLE_PARTICIPANTS = 5;

// Firestore Koleksiyonları
export const COLLECTIONS = {
  USERS: 'users',
  GROUPS: 'groups',
  EVENTS: 'events',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  FRIENDSHIPS: 'friendships',
  FRIEND_REQUESTS: 'friendRequests',
  KONUSMALAR: 'konusmalar',
  HIKAYELER: 'hikayeler',
  BILDIRIMLER: 'bildirimler',
  AVAILABILITY: 'availability',
  PLAN_REQUESTS: 'planRequests'
};
