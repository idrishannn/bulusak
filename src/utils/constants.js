// ============================================
// BULUŞAK - Sabitler (Constants)
// ============================================

export const gunler = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
export const gunlerTam = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
export const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export const saatler = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

export const reactEmojiler = ['❤️', '🔥', '😂', '👏', '🎉', '😍'];

export const etkinlikIkonlari = {
  kahve: '☕', yemek: '🍕', film: '🎬', spor: '⚽', oyun: '🎮',
  parti: '🎉', toplanti: '💼', gezi: '🏖️', alisveris: '🛍️', konser: '🎵', diger: '📅'
};

export const grupIkonlari = ['🎓', '💼', '⚽', '🎮', '🎵', '🍕', '☕', '🎬', '🏖️', '🎉', '👨‍👩‍👧‍👦', '🏋️', '📚', '🎨', '🚗', '✈️', '🏠', '💪', '🎸', '🍺'];

export const avatarlar = {
  erkek: ['👨', '👨‍🦱', '👨‍🦰', '👨‍🦳', '👨‍🦲', '🧔', '🧔‍♂️', '👱‍♂️', '👨‍🎓', '👨‍💼', '👨‍🔧', '👨‍🍳', '👨‍🎨', '👨‍🚀', '🕵️‍♂️', '👨‍⚕️', '👨‍🏫', '🤴', '🦸‍♂️', '🧙‍♂️'],
  kadin: ['👩', '👩‍🦱', '👩‍🦰', '👩‍🦳', '👱‍♀️', '👩‍🎓', '👩‍💼', '👩‍🔧', '👩‍🍳', '👩‍🎨', '👩‍🚀', '🕵️‍♀️', '👩‍⚕️', '👩‍🏫', '👸', '🦸‍♀️', '🧙‍♀️', '🧕', '👰', '🤱'],
  fantastik: ['🤖', '👽', '👻', '🎃', '😺', '🦊', '🐶', '🐱', '🦁', '🐯', '🐻', '🐼', '🐨', '🐸', '🦄', '🐲', '🦋', '🌸', '⭐', '🌈']
};

export const mekanOnerileri = [
  { isim: 'Starbucks Moda', tip: 'Kafe', puan: 4.5, emoji: '☕' },
  { isim: 'Big Chefs', tip: 'Restoran', puan: 4.3, emoji: '🍽️' },
  { isim: 'Cinemaximum', tip: 'Sinema', puan: 4.4, emoji: '🎬' },
  { isim: 'Playstation Cafe', tip: 'Oyun', puan: 4.2, emoji: '🎮' },
  { isim: 'Halı Saha Plus', tip: 'Spor', puan: 4.1, emoji: '⚽' },
];

export const katilimDurumlari = {
  varim: { label: '✓ Varım', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  bakariz: { label: '🤔 Bakarız', color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  yokum: { label: '✗ Yokum', color: 'from-red-500 to-rose-500', bgColor: 'bg-red-100', textColor: 'text-red-700' }
};

export const DEFAULTS = { avatar: '👨', grupEmoji: '🎉', etkinlikIkon: 'kahve', mekan: 'Belirtilmedi' };
