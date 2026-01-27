// ============================================
// BULUŞAK - Yardımcı Fonksiyonlar
// ============================================

import { gunler, gunlerTam, aylar } from './constants';

export const gunAdiGetir = (tarih) => gunlerTam[new Date(tarih).getDay()];
export const gunKisaAdiGetir = (tarih) => gunler[new Date(tarih).getDay()];
export const tarihFormatla = (tarih) => { const d = new Date(tarih); return `${d.getDate()} ${aylar[d.getMonth()]}`; };
export const tarihKisaFormatla = (tarih) => { const d = new Date(tarih); return `${d.getDate()} ${aylar[d.getMonth()]?.slice(0, 3)}`; };
export const tarihTamFormatla = (tarih) => { const d = new Date(tarih); return `${gunlerTam[d.getDay()]}, ${d.getDate()} ${aylar[d.getMonth()]} ${d.getFullYear()}`; };
export const saatFormatla = (tarih) => new Date(tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
export const simdikiSaat = () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
export const ayniGunMu = (tarih1, tarih2) => new Date(tarih1).toDateString() === new Date(tarih2).toDateString();
export const bugunMu = (tarih) => ayniGunMu(tarih, new Date());
export const gecmisMi = (tarih) => { const b = new Date(); b.setHours(0,0,0,0); const k = new Date(tarih); k.setHours(0,0,0,0); return k < b; };

export const haftaninGunleriniGetir = (tarih = new Date()) => {
  const gunlerArr = [];
  const baslangic = new Date(tarih);
  baslangic.setDate(tarih.getDate() - tarih.getDay() + 1);
  for (let i = 0; i < 7; i++) { const gun = new Date(baslangic); gun.setDate(baslangic.getDate() + i); gunlerArr.push(gun); }
  return gunlerArr;
};

export const kullaniciAdiFormatla = (username) => !username ? '@kullanici' : username.startsWith('@') ? username : `@${username}`;
export const kullaniciAdiTemizle = (username) => !username ? '' : username.replace('@', '').toLowerCase().trim();
export const basHarfleriAl = (isim) => !isim ? '?' : isim.split(' ').map(k => k[0]).join('').toUpperCase().slice(0, 2);
export const metniKisalt = (metin, max = 50) => !metin ? '' : metin.length <= max ? metin : metin.slice(0, max) + '...';
export const rastgeleId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
export const sayiFormatla = (s) => s >= 1000000 ? (s/1000000).toFixed(1)+'M' : s >= 1000 ? (s/1000).toFixed(1)+'K' : s.toString();
export const emailGecerliMi = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const kullaniciAdiGecerliMi = (username) => /^[a-zA-Z0-9_]{3,20}$/.test(username);
export const sifreGucluMu = (sifre) => sifre && sifre.length >= 6;

export const debounce = (func, wait = 300) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); }; };
export const throttle = (func, limit = 100) => { let inThrottle; return (...args) => { if (!inThrottle) { func.apply(this, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } }; };
