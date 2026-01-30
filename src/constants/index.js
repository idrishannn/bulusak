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

// Varsayılan Keşfet Ayarları
export const DEFAULT_DISCOVER_SETTINGS = {
  radius: 25,
  centerLocation: null
};

// Türkiye'deki Popüler Şehirler (Merkez Konum Seçimi İçin)
export const POPULAR_LOCATIONS = [
  { id: 'istanbul', name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
  { id: 'ankara', name: 'Ankara', lat: 39.9334, lng: 32.8597 },
  { id: 'izmir', name: 'İzmir', lat: 38.4237, lng: 27.1428 },
  { id: 'antalya', name: 'Antalya', lat: 36.8969, lng: 30.7133 },
  { id: 'bursa', name: 'Bursa', lat: 40.1885, lng: 29.0610 },
  { id: 'trabzon', name: 'Trabzon', lat: 41.0027, lng: 39.7168 },
  { id: 'rize', name: 'Rize', lat: 41.0201, lng: 40.5234 },
  { id: 'adana', name: 'Adana', lat: 37.0000, lng: 35.3213 },
  { id: 'konya', name: 'Konya', lat: 37.8746, lng: 32.4932 },
  { id: 'gaziantep', name: 'Gaziantep', lat: 37.0662, lng: 37.3833 }
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

// FAZ 1 - Plan Kategorileri
export const PLAN_CATEGORIES = [
  { id: 'tumu', label: 'Tümü', emoji: '✨', color: 'gold' },
  { id: 'kahve', label: 'Kahve', emoji: '☕', color: 'amber' },
  { id: 'yemek', label: 'Yemek', emoji: '🍽️', color: 'orange' },
  { id: 'sinema', label: 'Sinema', emoji: '🎬', color: 'purple' },
  { id: 'spor', label: 'Spor', emoji: '⚽', color: 'green' },
  { id: 'oyun', label: 'Oyun', emoji: '🎮', color: 'blue' },
  { id: 'konser', label: 'Konser', emoji: '🎵', color: 'pink' },
  { id: 'outdoor', label: 'Outdoor', emoji: '🏃', color: 'emerald' },
  { id: 'kultur', label: 'Kültür', emoji: '🎨', color: 'violet' },
  { id: 'seyahat', label: 'Seyahat', emoji: '✈️', color: 'sky' },
  { id: 'parti', label: 'Parti', emoji: '🎉', color: 'rose' }
];

// FAZ 1 - Kategori Renkleri (Tailwind class'ları)
export const CATEGORY_COLORS = {
  gold: { bg: 'bg-gold-500/10', text: 'text-gold-500', border: 'border-gold-500/30' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
  green: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/30' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/30' },
  sky: { bg: 'bg-sky-500/10', text: 'text-sky-500', border: 'border-sky-500/30' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/30' }
};

// FAZ 1 - Bütçe Aralıkları
export const BUDGET_RANGES = [
  { id: 'free', label: 'Ücretsiz', emoji: '🆓', value: 0 },
  { id: 'low', label: '₺', emoji: '💵', value: 1 },
  { id: 'medium', label: '₺₺', emoji: '💵💵', value: 2 },
  { id: 'high', label: '₺₺₺', emoji: '💰', value: 3 },
  { id: 'premium', label: '₺₺₺₺', emoji: '💎', value: 4 }
];

// FAZ 1 - Varsayılan Kategori Resimleri (Kapak fotoğrafı yoksa kullanılacak)
export const DEFAULT_CATEGORY_IMAGES = {
  kahve: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
  yemek: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
  sinema: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop',
  spor: 'https://images.unsplash.com/photo-1461896836934- voices8ad91cd?w=400&h=300&fit=crop',
  oyun: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
  konser: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop',
  outdoor: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
  kultur: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=300&fit=crop',
  seyahat: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop',
  parti: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
  default: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop'
};

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
