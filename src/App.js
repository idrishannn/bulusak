import React, { useState, useEffect } from 'react';
import { googleIleGiris, cikisYap, kullaniciBilgisiGetir } from './firebase';
// ============================================
// BULUŞAK v6.0 - Tam Çalışır Versiyon
// Header sola yaslı, Story düzeltildi
// Firebase entegrasyonu hazır (ayrı dosyada)
// ============================================

const gunler = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const gunlerTam = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const reactEmojiler = ['❤️', '🔥', '😂', '👏', '🎉', '😍'];

const etkinlikIkonlari = {
  kahve: '☕',
  yemek: '🍕',
  film: '🎬',
  spor: '⚽',
  oyun: '🎮',
  parti: '🎉',
  toplanti: '💼',
  gezi: '🏖️',
  alisveris: '🛍️',
  konser: '🎵',
  diger: '📅'
};

const grupIkonlari = ['🎓', '💼', '⚽', '🎮', '🎵', '🍕', '☕', '🎬', '🏖️', '🎉', '👨‍👩‍👧‍👦', '🏋️', '📚', '🎨', '🚗', '✈️', '🏠', '💪', '🎸', '🍺'];

const avatarlar = {
  erkek: ['👨', '👨‍🦱', '👨‍🦰', '👨‍🦳', '👨‍🦲', '🧔', '🧔‍♂️', '👱‍♂️', '👨‍🎓', '👨‍💼', '👨‍🔧', '👨‍🍳', '👨‍🎨', '👨‍🚀', '🕵️‍♂️', '👨‍⚕️', '👨‍🏫', '🤴', '🦸‍♂️', '🧙‍♂️'],
  kadin: ['👩', '👩‍🦱', '👩‍🦰', '👩‍🦳', '👱‍♀️', '👩‍🎓', '👩‍💼', '👩‍🔧', '👩‍🍳', '👩‍🎨', '👩‍🚀', '🕵️‍♀️', '👩‍⚕️', '👩‍🏫', '👸', '🦸‍♀️', '🧙‍♀️', '🧕', '👰', '🤱'],
  fantastik: ['🤖', '👽', '👻', '🎃', '😺', '🦊', '🐶', '🐱', '🦁', '🐯', '🐻', '🐼', '🐨', '🐸', '🦄', '🐲', '🦋', '🌸', '⭐', '🌈']
};

const demoKullanicilar = [
  { id: 1, isim: 'Ahmet', kullaniciAdi: '@ahmet', avatar: '🧔', renk: '#FF6B35', online: true, bio: 'Kahve tutkunu ☕' },
  { id: 2, isim: 'Ayşe', kullaniciAdi: '@ayse', avatar: '👩‍🎨', renk: '#FF8C42', online: true, bio: 'Sanat & Tasarım 🎨' },
  { id: 3, isim: 'Mehmet', kullaniciAdi: '@mehmet', avatar: '👨‍💼', renk: '#FFD166', online: false, bio: 'İş & Eğlence 💼' },
  { id: 4, isim: 'Zeynep', kullaniciAdi: '@zeynep', avatar: '👩‍🎓', renk: '#F4845F', online: true, bio: 'Öğrenci hayatı 📚' },
  { id: 5, isim: 'Can', kullaniciAdi: '@can', avatar: '🦊', renk: '#F7B267', online: false, bio: 'Gamer 🎮' },
];

const mekanOnerileri = [
  { isim: 'Starbucks Moda', tip: 'Kafe', puan: 4.5, emoji: '☕' },
  { isim: 'Big Chefs', tip: 'Restoran', puan: 4.3, emoji: '🍽️' },
  { isim: 'Cinemaximum', tip: 'Sinema', puan: 4.4, emoji: '🎬' },
  { isim: 'Playstation Cafe', tip: 'Oyun', puan: 4.2, emoji: '🎮' },
  { isim: 'Halı Saha Plus', tip: 'Spor', puan: 4.1, emoji: '⚽' },
];

// Tema - Sadece Light Mode
const tema = {
  bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100',
  bgSecondary: 'bg-white/60',
  bgCard: 'bg-white',
  bgHover: 'hover:bg-orange-50',
  text: 'text-gray-800',
  textSecondary: 'text-gray-600',
  textMuted: 'text-gray-500',
  border: 'border-orange-100',
  inputBg: 'bg-gray-50',
  inputText: 'text-gray-800 placeholder-gray-400',
  gradient: 'from-orange-500 via-amber-500 to-orange-400',
  cardShadow: 'shadow-lg shadow-orange-100/50'
};

// ============================================
// ANA UYGULAMA
// ============================================

export default function BulusakApp() {
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [kayitAsamasi, setKayitAsamasi] = useState('giris');
  const [kullanici, setKullanici] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  
  const [aktifSayfa, setAktifSayfa] = useState('feed');
  const [seciliGrup, setSeciliGrup] = useState(null);
  const [musaitlikler, setMusaitlikler] = useState({});
  
  const [gruplar, setGruplar] = useState([
    { id: 1, isim: 'Üniversite Tayfa', emoji: '🎓', uyeler: [1, 2, 3, 4], renk: '#FF6B35' },
    { id: 2, isim: 'İş Arkadaşları', emoji: '💼', uyeler: [1, 3, 5], renk: '#FF8C42' },
    { id: 3, isim: 'Futbol Grubu', emoji: '⚽', uyeler: [1, 2, 5], renk: '#FFD166' },
  ]);
  
  const [etkinlikler, setEtkinlikler] = useState([
    {
      id: 1,
      baslik: 'Rahatlama Kahvesi',
      ikon: 'kahve',
      grup: { id: 1, isim: 'Üniversite Tayfa', emoji: '🎓', uyeler: [1, 2, 3, 4], renk: '#FF6B35' },
      tarih: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      saat: '15:00',
      mekan: 'Kadıköy Moda',
      katilimcilar: [
        { kullanici: demoKullanicilar[0], durum: 'varim' },
        { kullanici: demoKullanicilar[1], durum: 'varim' },
        { kullanici: demoKullanicilar[2], durum: 'bakariz' },
        { kullanici: demoKullanicilar[3], durum: 'bekliyor' },
      ],
      durum: 'aktif',
      reactler: [],
      mesajlar: [
        { kullanici: demoKullanicilar[1], mesaj: 'Moda sahil olsun mu?', zaman: '10:30' },
        { kullanici: demoKullanicilar[0], mesaj: 'Olur, güzel hava var', zaman: '10:35' },
      ]
    },
    {
      id: 2,
      baslik: 'Haftalık Futbol',
      ikon: 'spor',
      grup: { id: 3, isim: 'Futbol Grubu', emoji: '⚽', uyeler: [1, 2, 5], renk: '#FFD166' },
      tarih: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      saat: '19:00',
      mekan: 'Halı Saha - Ataşehir',
      katilimcilar: [
        { kullanici: demoKullanicilar[0], durum: 'varim' },
        { kullanici: demoKullanicilar[1], durum: 'varim' },
        { kullanici: demoKullanicilar[4], durum: 'varim' },
      ],
      durum: 'aktif',
      reactler: [],
      mesajlar: []
    },
  ]);
  
  const [aktiviteler, setAktiviteler] = useState([
    {
      id: 1,
      tip: 'yeni_plan',
      kullanici: demoKullanicilar[1],
      plan: { baslik: 'Kahve Molası', ikon: 'kahve', tarih: 'Yarın 15:00' },
      zaman: '5 dk önce',
      reactler: [
        { emoji: '❤️', kullanicilar: [demoKullanicilar[0], demoKullanicilar[3]] },
        { emoji: '🔥', kullanicilar: [demoKullanicilar[2]] },
      ]
    },
    {
      id: 2,
      tip: 'katilim',
      kullanici: demoKullanicilar[2],
      plan: { baslik: 'Haftalık Futbol', ikon: 'spor' },
      zaman: '1 saat önce',
      reactler: [{ emoji: '👏', kullanicilar: [demoKullanicilar[0]] }]
    },
  ]);
  
  const [katilimIstekleri, setKatilimIstekleri] = useState([]);
  const [bildirim, setBildirim] = useState(null);
  const [canSikildiModu, setCanSikildiModu] = useState(false);
  const [modalAcik, setModalAcik] = useState(null);
  const [seciliZaman, setSeciliZaman] = useState(null);
  const [seciliEtkinlik, setSeciliEtkinlik] = useState(null);
  const [seciliAvatar, setSeciliAvatar] = useState('👨');
  const [avatarKategori, setAvatarKategori] = useState('erkek');
  
  const [bucketList, setBucketList] = useState([
    { id: 1, baslik: 'Kapadokya\'da balon turu', tamamlandi: false, emoji: '🎈' },
    { id: 2, baslik: 'Birlikte konser', tamamlandi: true, emoji: '🎵' },
    { id: 3, baslik: 'Kamp yapmak', tamamlandi: false, emoji: '⛺' },
  ]);
  const [bildirimler, setBildirimler] = useState([
    { id: 1, mesaj: '☕ Kahve Molası 1 saat kaldı!', zaman: 'Az önce', okundu: false },
    { id: 2, mesaj: '🎉 Ayşe yeni plan oluşturdu', zaman: '5 dk önce', okundu: false },
  ]);
  const [galeri, setGaleri] = useState([]);
  const [animasyonluKart, setAnimasyonluKart] = useState(null);

  const bugun = new Date();
  
  const haftaninGunleri = [];
  const haftaninBaslangici = new Date(bugun);
  haftaninBaslangici.setDate(bugun.getDate() - bugun.getDay() + 1);
  
  for (let i = 0; i < 7; i++) {
    const gun = new Date(haftaninBaslangici);
    gun.setDate(haftaninBaslangici.getDate() + i);
    haftaninGunleri.push(gun);
  }

  const saatler = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

  // Fonksiyonlar
  const bildirimGoster = (mesaj, tip = 'basari') => {
    setBildirim({ mesaj, tip });
    setTimeout(() => setBildirim(null), 3000);
  };

  // Google ile giriş (Firebase entegrasyonu için hazır)
  const googleIleGirisYap = async () => {
    setYukleniyor(true);
    
    try {
      const result = await googleIleGiris();
      if (result.success) {
        if (result.isNewUser) {
          // Yeni kullanıcı - avatar seçimine git
          setKayitAsamasi('avatar');
        } else {
          // Mevcut kullanıcı - bilgilerini al
          const userData = await kullaniciBilgisiGetir(result.user.uid);
          if (userData) {
            setKullanici(userData);
            setGirisYapildi(true);
            bildirimGoster('Tekrar hoş geldin! 🎉');
          } else {
            setKayitAsamasi('avatar');
          }
        }
      } else {
        bildirimGoster('Giriş başarısız: ' + result.error, 'hata');
      }
    } catch (error) {
      bildirimGoster('Bir hata oluştu!', 'hata');
      console.error(error);
    }
    
    setYukleniyor(false);
  };

  const etkinlikBul = (tarih, saat) => {
    return etkinlikler.filter(e => {
      const eTarih = new Date(e.tarih);
      return eTarih.toDateString() === tarih.toDateString() && e.saat === saat;
    });
  };

  const musaitlikToggle = (tarih, saat) => {
    const key = `${tarih.toDateString()}-${saat}`;
    setMusaitlikler(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const yeniGrupOlustur = (isim, emoji, uyeler) => {
    const yeniGrup = {
      id: Date.now(),
      isim,
      emoji,
      uyeler: [kullanici?.id || 1, ...uyeler],
      renk: '#FF6B35'
    };
    setGruplar(prev => [...prev, yeniGrup]);
    return yeniGrup;
  };

  const yeniEtkinlikOlustur = (data) => {
    const yeniEtkinlik = {
      id: Date.now(),
      baslik: data.baslik,
      ikon: data.ikon,
      grup: data.grup,
      tarih: data.tarih,
      saat: data.saat,
      mekan: data.mekan,
      katilimcilar: [{ kullanici: kullanici || demoKullanicilar[0], durum: 'varim' }],
      durum: 'aktif',
      reactler: [],
      mesajlar: []
    };
    
    setEtkinlikler(prev => [...prev, yeniEtkinlik]);
    
    setAktiviteler(prev => [{
      id: Date.now(),
      tip: 'yeni_plan',
      kullanici: kullanici || demoKullanicilar[0],
      plan: { baslik: data.baslik, ikon: data.ikon, tarih: `${gunlerTam[data.tarih.getDay()]} ${data.saat}` },
      zaman: 'Az önce',
      reactler: []
    }, ...prev]);
    
    bildirimGoster('Plan oluşturuldu! 🎉');
    setModalAcik(null);
  };

  const katilimIstegiGonder = (aktiviteId, plan) => {
    setAnimasyonluKart(aktiviteId);
    
    setTimeout(() => {
      setKatilimIstekleri(prev => [...prev, {
        id: Date.now(),
        plan: plan,
        durum: 'bekliyor',
        tarih: new Date()
      }]);
      
      setAktiviteler(prev => prev.filter(a => a.id !== aktiviteId));
      setAnimasyonluKart(null);
      bildirimGoster('İstek gönderildi! 📋 Planlar\'dan takip et');
    }, 800);
  };

  const katilimDurumuGuncelle = (etkinlikId, durum) => {
    setEtkinlikler(prev => prev.map(e => {
      if (e.id === etkinlikId) {
        const mevcutKatilimci = e.katilimcilar.find(k => k.kullanici.id === (kullanici?.id || 1));
        if (mevcutKatilimci) {
          return {
            ...e,
            katilimcilar: e.katilimcilar.map(k => 
              k.kullanici.id === (kullanici?.id || 1) ? { ...k, durum } : k
            )
          };
        } else {
          return {
            ...e,
            katilimcilar: [...e.katilimcilar, { kullanici: kullanici || demoKullanicilar[0], durum }]
          };
        }
      }
      return e;
    }));
    bildirimGoster(durum === 'varim' ? 'Katılım onaylandı! ✓' : durum === 'bakariz' ? 'Belki katılacaksın 🤔' : 'Katılmıyorsun ✗');
  };

  const reactEkle = (aktiviteId, emoji) => {
    setAktiviteler(prev => prev.map(a => {
      if (a.id === aktiviteId) {
        const mevcutReact = a.reactler.find(r => r.emoji === emoji);
        if (mevcutReact) {
          const kullaniciVarMi = mevcutReact.kullanicilar.some(k => k.id === (kullanici?.id || 1));
          if (kullaniciVarMi) {
            return {
              ...a,
              reactler: a.reactler.map(r => 
                r.emoji === emoji 
                  ? { ...r, kullanicilar: r.kullanicilar.filter(k => k.id !== (kullanici?.id || 1)) }
                  : r
              ).filter(r => r.kullanicilar.length > 0)
            };
          } else {
            return {
              ...a,
              reactler: a.reactler.map(r =>
                r.emoji === emoji
                  ? { ...r, kullanicilar: [...r.kullanicilar, kullanici || demoKullanicilar[0]] }
                  : r
              )
            };
          }
        } else {
          return {
            ...a,
            reactler: [...a.reactler, { emoji, kullanicilar: [kullanici || demoKullanicilar[0]] }]
          };
        }
      }
      return a;
    }));
  };

  // ============================================
  // GİRİŞ EKRANLARI
  // ============================================

  const GirisEkrani = () => (
    <div className={`min-h-screen ${tema.bg} flex flex-col`}>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 mb-2 tracking-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Buluşak
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full mb-3"></div>
          <p className={`${tema.textSecondary} text-lg`}>
            planla, buluş, yaşa ✨
          </p>
        </div>

        <div className="w-full max-w-sm space-y-3 mb-8">
          {[
            { emoji: '📅', text: 'Arkadaşlarınla takvim paylaş' },
            { emoji: '⚡', text: 'Ortak müsait zamanı anında bul' },
            { emoji: '🎉', text: 'Tek tıkla plan oluştur' },
          ].map((item, i) => (
            <div 
              key={i}
              className={`${tema.bgCard} ${tema.cardShadow} rounded-2xl p-4 flex items-center gap-4 border ${tema.border}`}
            >
              <span className="text-3xl">{item.emoji}</span>
              <span className={`${tema.text} font-medium`}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-3">
        {/* Google ile Giriş */}
        <button
          onClick={googleIleGirisYap}
          disabled={yukleniyor}
          className="w-full bg-white text-gray-700 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3 border border-gray-200"
        >
          {yukleniyor ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google ile Devam Et
            </>
          )}
        </button>

        {/* Hızlı Başla (Demo için) */}
        <button
          onClick={() => setKayitAsamasi('avatar')}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
        >
          🚀 Hızlı Başla (Demo)
        </button>

        <p className={`text-center text-sm ${tema.textMuted} mt-4`}>
          Devam ederek <span className="text-orange-500 font-medium">Kullanım Koşulları</span>'nı kabul ediyorsun
        </p>
      </div>
    </div>
  );

  const AvatarSecimEkrani = () => (
    <div className={`min-h-screen ${tema.bg} flex flex-col`}>
      <div className="p-4 flex items-center">
        <button onClick={() => setKayitAsamasi('giris')} className={`${tema.text} text-2xl`}>←</button>
      </div>

      <div className="flex-1 p-6">
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-black ${tema.text}`}>Avatarını Seç 🎨</h2>
          <p className={tema.textSecondary}>Seni en iyi yansıtan avatarı bul</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-amber-400 rounded-3xl flex items-center justify-center text-6xl shadow-2xl animate-bounce-slow">
            {seciliAvatar}
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-4">
          {[
            { key: 'erkek', label: '👨 Erkek' },
            { key: 'kadin', label: '👩 Kadın' },
            { key: 'fantastik', label: '🦄 Fantastik' },
          ].map(kat => (
            <button
              key={kat.key}
              onClick={() => setAvatarKategori(kat.key)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                avatarKategori === kat.key
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                  : `${tema.bgCard} ${tema.text} border ${tema.border}`
              }`}
            >
              {kat.label}
            </button>
          ))}
        </div>

        <div className={`${tema.bgCard} rounded-3xl p-4 border ${tema.border} ${tema.cardShadow}`}>
          <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto">
            {avatarlar[avatarKategori].map((avatar, i) => (
              <button
                key={i}
                onClick={() => setSeciliAvatar(avatar)}
                className={`w-14 h-14 rounded-2xl text-3xl flex items-center justify-center transition-all ${
                  seciliAvatar === avatar
                    ? 'bg-gradient-to-br from-orange-400 to-amber-400 shadow-lg scale-110 ring-4 ring-orange-300'
                    : `${tema.inputBg} ${tema.bgHover}`
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <button
          onClick={() => setKayitAsamasi('bilgi')}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg"
        >
          Devam Et →
        </button>
      </div>
    </div>
  );

  const BilgiEkrani = () => {
    const [isim, setIsim] = useState('');
    const [kullaniciAdi, setKullaniciAdi] = useState('');

    const tamamla = () => {
      setKullanici({
        id: 1,
        isim: isim || 'Kullanıcı',
        kullaniciAdi: kullaniciAdi || '@kullanici',
        avatar: seciliAvatar,
        online: true,
        bio: ''
      });
      setGirisYapildi(true);
      bildirimGoster('Hoş geldin! 🎉');
    };

    return (
      <div className={`min-h-screen ${tema.bg} flex flex-col`}>
        <div className="p-4 flex items-center">
          <button onClick={() => setKayitAsamasi('avatar')} className={`${tema.text} text-2xl`}>←</button>
        </div>

        <div className="flex-1 p-6">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-400 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-2xl">
              {seciliAvatar}
            </div>
            <h2 className={`text-2xl font-black ${tema.text}`}>Son Adım! 🚀</h2>
            <p className={tema.textSecondary}>Profilini tamamla</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>İsmin</label>
              <input
                type="text"
                value={isim}
                onChange={(e) => setIsim(e.target.value)}
                placeholder="Ahmet"
                className={`w-full ${tema.inputBg} ${tema.inputText} rounded-2xl p-4 border-2 border-transparent focus:border-orange-400 focus:outline-none transition-all`}
              />
            </div>

            <div>
              <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>Kullanıcı Adı</label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${tema.textMuted}`}>@</span>
                <input
                  type="text"
                  value={kullaniciAdi}
                  onChange={(e) => setKullaniciAdi(e.target.value.replace('@', ''))}
                  placeholder="ahmet"
                  className={`w-full ${tema.inputBg} ${tema.inputText} rounded-2xl p-4 pl-8 border-2 border-transparent focus:border-orange-400 focus:outline-none transition-all`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <button
            onClick={tamamla}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg"
          >
            Başlayalım! 🎉
          </button>
        </div>
      </div>
    );
  };

  // ============================================
  // MODALLAR (Öncekiyle aynı - değişmedi)
  // ============================================

  const YeniGrupModal = () => {
    const [grupAdi, setGrupAdi] = useState('');
    const [secilenEmoji, setSecilenEmoji] = useState('🎉');
    const [secilenUyeler, setSecilenUyeler] = useState([]);

    if (modalAcik !== 'yeniGrup') return null;

    const uyeToggle = (id) => {
      setSecilenUyeler(prev => 
        prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
      );
    };

    const handleOlustur = () => {
      if (!grupAdi.trim()) {
        bildirimGoster('Grup adı gerekli!', 'hata');
        return;
      }
      yeniGrupOlustur(grupAdi, secilenEmoji, secilenUyeler);
      bildirimGoster(`${secilenEmoji} ${grupAdi} oluşturuldu!`);
      setModalAcik(null);
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
        <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border-t ${tema.border} max-h-[85vh] overflow-y-auto`}>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-black ${tema.text}`}>👥 Yeni Grup Oluştur</h3>
            <button onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
          </div>

          <div className="mb-4">
            <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>Grup Adı</label>
            <input
              type="text"
              value={grupAdi}
              onChange={(e) => setGrupAdi(e.target.value)}
              placeholder="Cuma Akşamı Ekibi"
              className={`w-full ${tema.inputBg} ${tema.inputText} rounded-2xl p-4 border-2 border-transparent focus:border-orange-400 focus:outline-none`}
            />
          </div>

          <div className="mb-4">
            <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>Grup İkonu</label>
            <div className="flex flex-wrap gap-2">
              {grupIkonlari.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => setSecilenEmoji(emoji)}
                  className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                    secilenEmoji === emoji
                      ? 'bg-gradient-to-br from-orange-400 to-amber-400 shadow-lg scale-110'
                      : `${tema.inputBg} ${tema.bgHover}`
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>Üyeler</label>
            <div className="space-y-2">
              {demoKullanicilar.filter(k => k.id !== (kullanici?.id || 1)).map(k => (
                <button
                  key={k.id}
                  onClick={() => uyeToggle(k.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    secilenUyeler.includes(k.id)
                      ? 'bg-orange-100 border-2 border-orange-400'
                      : `${tema.inputBg} border-2 border-transparent`
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-xl">
                    {k.avatar}
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-bold ${tema.text}`}>{k.isim}</div>
                    <div className={`text-sm ${tema.textSecondary}`}>{k.kullaniciAdi}</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    secilenUyeler.includes(k.id)
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'border-gray-300'
                  }`}>
                    {secilenUyeler.includes(k.id) && '✓'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleOlustur}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg"
          >
            Grup Oluştur 🎉
          </button>
        </div>
      </div>
    );
  };

  const YeniPlanModal = () => {
    const [baslik, setBaslik] = useState('');
    const [secilenIkon, setSecilenIkon] = useState('kahve');
    const [mekan, setMekan] = useState('');
    const [secilenGrupId, setSecilenGrupId] = useState(seciliGrup?.id || gruplar[0]?.id);
    const [yeniGrupModu, setYeniGrupModu] = useState(false);
    const [yeniGrupAdi, setYeniGrupAdi] = useState('');
    const [yeniGrupEmoji, setYeniGrupEmoji] = useState('🎉');

    if (modalAcik !== 'yeniPlan' || !seciliZaman) return null;

    const handleOlustur = () => {
      if (!baslik.trim()) {
        bildirimGoster('Plan adı gerekli!', 'hata');
        return;
      }

      let hedefGrup;
      if (yeniGrupModu && yeniGrupAdi.trim()) {
        hedefGrup = yeniGrupOlustur(yeniGrupAdi, yeniGrupEmoji, []);
      } else {
        hedefGrup = gruplar.find(g => g.id === secilenGrupId);
      }

      yeniEtkinlikOlustur({
        baslik,
        ikon: secilenIkon,
        tarih: seciliZaman.tarih,
        saat: seciliZaman.saat,
        mekan: mekan || 'Belirtilmedi',
        grup: hedefGrup
      });
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
        <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border-t ${tema.border} max-h-[90vh] overflow-y-auto`}>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-black ${tema.text}`}>🎉 Yeni Plan</h3>
            <button onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
          </div>

          <div className={`${tema.inputBg} rounded-2xl p-4 mb-4 flex items-center gap-3`}>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center text-2xl">📅</div>
            <div>
              <div className={`font-bold ${tema.text}`}>{gunlerTam[seciliZaman.tarih.getDay()]}</div>
              <div className={tema.textSecondary}>{seciliZaman.tarih.getDate()} {aylar[seciliZaman.tarih.getMonth()]} • {seciliZaman.saat}</div>
            </div>
          </div>

          <div className="mb-4">
            <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>Plan Adı</label>
            <input
              type="text"
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              placeholder="Kahve içelim mi?"
              className={`w-full ${tema.inputBg} ${tema.inputText} rounded-2xl p-4 border-2 border-transparent focus:border-orange-400 focus:outline-none`}
            />
          </div>

          <div className="mb-4">
            <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>Kategori</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(etkinlikIkonlari).map(([key, icon]) => (
                <button
                  key={key}
                  onClick={() => setSecilenIkon(key)}
                  className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                    secilenIkon === key
                      ? 'bg-gradient-to-br from-orange-400 to-amber-400 shadow-lg scale-110'
                      : `${tema.inputBg} ${tema.bgHover}`
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>👥 Kimlerle?</label>
            
            {!yeniGrupModu ? (
              <>
                <div className="space-y-2 mb-3">
                  {gruplar.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setSecilenGrupId(g.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        secilenGrupId === g.id
                          ? 'bg-orange-100 border-2 border-orange-400'
                          : `${tema.inputBg} border-2 border-transparent`
                      }`}
                    >
                      <span className="text-2xl">{g.emoji}</span>
                      <span className={`font-medium ${tema.text}`}>{g.isim}</span>
                      <span className={`text-sm ${tema.textSecondary} ml-auto`}>{g.uyeler.length} kişi</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setYeniGrupModu(true)}
                  className={`w-full p-3 rounded-xl border-2 border-dashed border-orange-300 ${tema.text} font-medium flex items-center justify-center gap-2 ${tema.bgHover}`}
                >
                  ➕ Yeni Grup Oluştur
                </button>
              </>
            ) : (
              <div className={`${tema.inputBg} rounded-2xl p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={() => setYeniGrupModu(false)} className="text-orange-500">←</button>
                  <span className={`font-bold ${tema.text}`}>Yeni Grup</span>
                </div>
                <input
                  type="text"
                  value={yeniGrupAdi}
                  onChange={(e) => setYeniGrupAdi(e.target.value)}
                  placeholder="Grup adı"
                  className={`w-full ${tema.bgCard} ${tema.inputText} rounded-xl p-3 mb-3 border ${tema.border}`}
                />
                <div className="flex gap-2 flex-wrap">
                  {grupIkonlari.slice(0, 10).map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => setYeniGrupEmoji(emoji)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center ${
                        yeniGrupEmoji === emoji ? 'bg-orange-200' : tema.bgCard
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>📍 Mekan</label>
            <input
              type="text"
              value={mekan}
              onChange={(e) => setMekan(e.target.value)}
              placeholder="Starbucks Moda"
              className={`w-full ${tema.inputBg} ${tema.inputText} rounded-2xl p-4 border-2 border-transparent focus:border-orange-400 focus:outline-none`}
            />
            
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
              {mekanOnerileri.slice(0, 4).map((m, i) => (
                <button
                  key={i}
                  onClick={() => setMekan(m.isim)}
                  className={`${tema.inputBg} px-3 py-2 rounded-xl text-sm whitespace-nowrap flex items-center gap-1 ${tema.text} ${tema.bgHover}`}
                >
                  {m.emoji} {m.isim}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleOlustur}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Plan Oluştur 🚀
          </button>
        </div>
      </div>
    );
  };

  const EtkinlikDetayModal = () => {
    const [yeniMesaj, setYeniMesaj] = useState('');

    if (modalAcik !== 'detay' || !seciliEtkinlik) return null;

    const tarih = new Date(seciliEtkinlik.tarih);
    const varimSayisi = seciliEtkinlik.katilimcilar.filter(k => k.durum === 'varim').length;
    const kullanicininDurumu = seciliEtkinlik.katilimcilar.find(k => k.kullanici.id === (kullanici?.id || 1))?.durum;

    const mesajGonder = () => {
      if (!yeniMesaj.trim()) return;
      setEtkinlikler(prev => prev.map(e => {
        if (e.id === seciliEtkinlik.id) {
          return {
            ...e,
            mesajlar: [...e.mesajlar, {
              kullanici: kullanici || demoKullanicilar[0],
              mesaj: yeniMesaj,
              zaman: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            }]
          };
        }
        return e;
      }));
      setSeciliEtkinlik(prev => ({
        ...prev,
        mesajlar: [...prev.mesajlar, {
          kullanici: kullanici || demoKullanicilar[0],
          mesaj: yeniMesaj,
          zaman: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }]
      }));
      setYeniMesaj('');
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
        <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg animate-slide-up border-t ${tema.border} max-h-[95vh] flex flex-col`}>
          <div className="p-6 border-b border-gray-100">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  {etkinlikIkonlari[seciliEtkinlik.ikon]}
                </div>
                <div>
                  <h3 className={`text-xl font-black ${tema.text}`}>{seciliEtkinlik.baslik}</h3>
                  <p className={tema.textSecondary}>{seciliEtkinlik.grup.emoji} {seciliEtkinlik.grup.isim}</p>
                </div>
              </div>
              <button onClick={() => { setModalAcik(null); setSeciliEtkinlik(null); }} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`${tema.inputBg} rounded-xl p-3`}>
                <div className={`text-xs ${tema.textMuted} mb-1`}>📅 Tarih</div>
                <div className={`font-bold ${tema.text}`}>{gunlerTam[tarih.getDay()]}</div>
                <div className={`text-sm ${tema.textSecondary}`}>{tarih.getDate()} {aylar[tarih.getMonth()]}</div>
              </div>
              <div className={`${tema.inputBg} rounded-xl p-3`}>
                <div className={`text-xs ${tema.textMuted} mb-1`}>⏰ Saat</div>
                <div className={`font-bold ${tema.text}`}>{seciliEtkinlik.saat}</div>
                <div className={`text-sm ${tema.textSecondary}`}>📍 {seciliEtkinlik.mekan}</div>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {[
                { durum: 'varim', label: '✓ Varım', color: 'from-green-500 to-emerald-500' },
                { durum: 'bakariz', label: '🤔 Bakarız', color: 'from-yellow-500 to-orange-500' },
                { durum: 'yokum', label: '✗ Yokum', color: 'from-red-500 to-rose-500' },
              ].map(btn => (
                <button
                  key={btn.durum}
                  onClick={() => katilimDurumuGuncelle(seciliEtkinlik.id, btn.durum)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                    kullanicininDurumu === btn.durum
                      ? `bg-gradient-to-r ${btn.color} text-white shadow-lg scale-105`
                      : `${tema.inputBg} ${tema.text} ${tema.bgHover}`
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div>
              <div className={`text-sm font-bold ${tema.textSecondary} mb-2`}>Katılımcılar ({varimSayisi}/{seciliEtkinlik.katilimcilar.length})</div>
              <div className="flex flex-wrap gap-2">
                {seciliEtkinlik.katilimcilar.map((k, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                      k.durum === 'varim' ? 'bg-green-100 text-green-700' :
                      k.durum === 'bakariz' ? 'bg-yellow-100 text-yellow-700' :
                      k.durum === 'yokum' ? 'bg-red-100 text-red-700' :
                      `${tema.inputBg} ${tema.text}`
                    }`}
                  >
                    <span className="text-lg">{k.kullanici.avatar}</span>
                    <span className="font-medium">{k.kullanici.isim}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {seciliEtkinlik.mesajlar.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.kullanici.id === (kullanici?.id || 1) ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-sm">
                  {m.kullanici.avatar}
                </div>
                <div className={`max-w-[70%] ${m.kullanici.id === (kullanici?.id || 1) ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : tema.inputBg} rounded-2xl px-4 py-2`}>
                  <div className={`text-xs ${m.kullanici.id === (kullanici?.id || 1) ? 'text-white/70' : tema.textMuted}`}>{m.kullanici.isim}</div>
                  <div className={m.kullanici.id === (kullanici?.id || 1) ? 'text-white' : tema.text}>{m.mesaj}</div>
                  <div className={`text-xs ${m.kullanici.id === (kullanici?.id || 1) ? 'text-white/50' : tema.textMuted} text-right`}>{m.zaman}</div>
                </div>
              </div>
            ))}
            {seciliEtkinlik.mesajlar.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl">💬</span>
                <p className={`${tema.textSecondary} mt-2`}>Henüz mesaj yok</p>
              </div>
            )}
          </div>

          <div className={`p-4 border-t ${tema.border}`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={yeniMesaj}
                onChange={(e) => setYeniMesaj(e.target.value)}
                placeholder="Mesaj yaz..."
                onKeyPress={(e) => e.key === 'Enter' && mesajGonder()}
                className={`flex-1 ${tema.inputBg} ${tema.inputText} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400`}
              />
              <button
                onClick={mesajGonder}
                className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white"
              >
                📤
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HizliPlanModal = () => {
    const [baslik, setBaslik] = useState('');
    const [secilenIkon, setSecilenIkon] = useState('kahve');
    const [seciliTarih, setSeciliTarih] = useState(new Date());
    const [seciliSaat, setSeciliSaat] = useState('15:00');
    const [mekan, setMekan] = useState('');
    const [secilenGrupId, setSecilenGrupId] = useState(gruplar[0]?.id);
    const [yeniGrupModu, setYeniGrupModu] = useState(false);
    const [yeniGrupAdi, setYeniGrupAdi] = useState('');
    const [yeniGrupEmoji, setYeniGrupEmoji] = useState('🎉');

    if (modalAcik !== 'hizliPlan') return null;

    const handleOlustur = () => {
      if (!baslik.trim()) {
        bildirimGoster('Plan adı gerekli!', 'hata');
        return;
      }
      
      let hedefGrup;
      if (yeniGrupModu && yeniGrupAdi.trim()) {
        hedefGrup = yeniGrupOlustur(yeniGrupAdi, yeniGrupEmoji, []);
      } else {
        hedefGrup = gruplar.find(g => g.id === secilenGrupId);
      }

      yeniEtkinlikOlustur({
        baslik,
        ikon: secilenIkon,
        tarih: seciliTarih,
        saat: seciliSaat,
        mekan: mekan || 'Belirtilmedi',
        grup: hedefGrup
      });
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
        <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border-t ${tema.border} max-h-[90vh] overflow-y-auto`}>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-black ${tema.text}`}>⚡ Hızlı Plan</h3>
            <button onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
          </div>

          <div className="mb-4">
            <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>Plan Adı</label>
            <input
              type="text"
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              placeholder="Ne yapalım?"
              className={`w-full ${tema.inputBg} ${tema.inputText} rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-400`}
            />
          </div>

          <div className="mb-4">
            <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>Kategori</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(etkinlikIkonlari).slice(0, 6).map(([key, icon]) => (
                <button
                  key={key}
                  onClick={() => setSecilenIkon(key)}
                  className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                    secilenIkon === key
                      ? 'bg-gradient-to-br from-orange-400 to-amber-400 shadow-lg scale-110'
                      : `${tema.inputBg} ${tema.bgHover}`
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>📅 Tarih</label>
              <input
                type="date"
                value={seciliTarih.toISOString().split('T')[0]}
                onChange={(e) => setSeciliTarih(new Date(e.target.value))}
                className={`w-full ${tema.inputBg} ${tema.inputText} rounded-xl p-3 focus:outline-none`}
              />
            </div>
            <div>
              <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>⏰ Saat</label>
              <select
                value={seciliSaat}
                onChange={(e) => setSeciliSaat(e.target.value)}
                className={`w-full ${tema.inputBg} ${tema.inputText} rounded-xl p-3 focus:outline-none`}
              >
                {saatler.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>👥 Grup</label>
            {!yeniGrupModu ? (
              <>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                  {gruplar.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setSecilenGrupId(g.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                        secilenGrupId === g.id
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                          : `${tema.inputBg} ${tema.text}`
                      }`}
                    >
                      <span>{g.emoji}</span>
                      <span className="font-medium">{g.isim}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setYeniGrupModu(true)}
                  className={`w-full p-2 rounded-xl border-2 border-dashed border-orange-300 ${tema.text} text-sm font-medium flex items-center justify-center gap-2`}
                >
                  ➕ Yeni Grup
                </button>
              </>
            ) : (
              <div className={`${tema.inputBg} rounded-2xl p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={() => setYeniGrupModu(false)} className="text-orange-500">←</button>
                  <span className={`font-bold ${tema.text}`}>Yeni Grup</span>
                </div>
                <input
                  type="text"
                  value={yeniGrupAdi}
                  onChange={(e) => setYeniGrupAdi(e.target.value)}
                  placeholder="Grup adı"
                  className={`w-full ${tema.bgCard} ${tema.inputText} rounded-xl p-3 mb-3 border ${tema.border}`}
                />
                <div className="flex gap-2 flex-wrap">
                  {grupIkonlari.slice(0, 10).map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => setYeniGrupEmoji(emoji)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center ${
                        yeniGrupEmoji === emoji ? 'bg-orange-200' : tema.bgCard
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>📍 Mekan (Opsiyonel)</label>
            <input
              type="text"
              value={mekan}
              onChange={(e) => setMekan(e.target.value)}
              placeholder="Nerede buluşalım?"
              className={`w-full ${tema.inputBg} ${tema.inputText} rounded-xl p-3 focus:outline-none`}
            />
          </div>

          <button
            onClick={handleOlustur}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg"
          >
            Plan Oluştur 🚀
          </button>
        </div>
      </div>
    );
  };

  const BucketListModal = () => {
    const [yeniItem, setYeniItem] = useState('');
    const [yeniEmoji, setYeniEmoji] = useState('🎯');

    if (modalAcik !== 'bucketList') return null;

    const ekle = () => {
      if (!yeniItem.trim()) return;
      setBucketList(prev => [...prev, { id: Date.now(), baslik: yeniItem, tamamlandi: false, emoji: yeniEmoji }]);
      setYeniItem('');
      bildirimGoster('Listeye eklendi! ✨');
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
        <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border-t ${tema.border} max-h-[85vh] flex flex-col`}>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-black ${tema.text}`}>📋 Bucket List</h3>
            <button onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
          </div>

          <div className="flex gap-2 mb-4">
            <select
              value={yeniEmoji}
              onChange={(e) => setYeniEmoji(e.target.value)}
              className={`w-14 ${tema.inputBg} ${tema.inputText} rounded-xl text-center text-xl`}
            >
              {['🎯', '🎈', '🎵', '⛺', '🏔️', '🎪', '🎭', '🎨', '🎬', '🍕'].map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <input
              type="text"
              value={yeniItem}
              onChange={(e) => setYeniItem(e.target.value)}
              placeholder="Birlikte yapmak istediğiniz şey..."
              onKeyPress={(e) => e.key === 'Enter' && ekle()}
              className={`flex-1 ${tema.inputBg} ${tema.inputText} rounded-xl px-4 py-3 focus:outline-none`}
            />
            <button onClick={ekle} className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white text-xl">+</button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {bucketList.map(item => (
              <div 
                key={item.id}
                className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                  item.tamamlandi ? 'bg-green-50' : tema.inputBg
                }`}
              >
                <button 
                  onClick={() => setBucketList(prev => prev.map(i => i.id === item.id ? { ...i, tamamlandi: !i.tamamlandi } : i))}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    item.tamamlandi ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                  }`}
                >
                  {item.tamamlandi && '✓'}
                </button>
                <span className="text-2xl">{item.emoji}</span>
                <span className={`flex-1 font-medium ${item.tamamlandi ? 'line-through text-gray-400' : tema.text}`}>
                  {item.baslik}
                </span>
                <button onClick={() => setBucketList(prev => prev.filter(i => i.id !== item.id))} className={`${tema.textMuted} hover:text-red-500`}>🗑️</button>
              </div>
            ))}
          </div>

          <div className={`mt-4 pt-4 border-t ${tema.border} text-center`}>
            <span className={`${tema.textSecondary} text-sm`}>
              {bucketList.filter(i => i.tamamlandi).length}/{bucketList.length} tamamlandı 🎉
            </span>
          </div>
        </div>
      </div>
    );
  };

  const BildirimlerModal = () => {
    if (modalAcik !== 'bildirimler') return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
        <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border-t ${tema.border} max-h-[70vh]`}>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-black ${tema.text}`}>🔔 Bildirimler</h3>
            <button onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
          </div>

          <div className="space-y-3 overflow-y-auto">
            {bildirimler.map(b => (
              <div 
                key={b.id}
                className={`flex items-center gap-3 p-4 rounded-2xl ${b.okundu ? tema.inputBg : 'bg-orange-50'}`}
              >
                <div className={`w-3 h-3 rounded-full ${b.okundu ? 'bg-gray-300' : 'bg-orange-500'}`}></div>
                <div className="flex-1">
                  <p className={`font-medium ${tema.text}`}>{b.mesaj}</p>
                  <p className={`text-sm ${tema.textMuted}`}>{b.zaman}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const GaleriModal = () => {
    if (modalAcik !== 'galeri') return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
        <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border-t ${tema.border} max-h-[85vh] flex flex-col`}>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-black ${tema.text}`}>📸 Anılar</h3>
            <button onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
          </div>

          <button
            onClick={() => { setGaleri(prev => [...prev, { id: Date.now(), tarih: new Date().toLocaleDateString('tr-TR') }]); bildirimGoster('Fotoğraf eklendi! 📸'); }}
            className={`w-full ${tema.inputBg} border-2 border-dashed ${tema.border} rounded-2xl p-6 mb-4 flex flex-col items-center gap-2 ${tema.bgHover} transition-all`}
          >
            <span className="text-4xl">📷</span>
            <span className={`font-medium ${tema.text}`}>Fotoğraf Ekle</span>
          </button>

          <div className="flex-1 overflow-y-auto">
            {galeri.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {galeri.map(foto => (
                  <div key={foto.id} className="relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-orange-200 to-amber-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl">📸</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                      <p className="text-white text-xs">{foto.tarih}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-6xl">📷</span>
                <p className={`${tema.textSecondary} mt-4`}>Henüz fotoğraf yok</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const AvatarDegistirModal = () => {
    if (modalAcik !== 'avatarDegistir') return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
        <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border-t ${tema.border}`}>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-black ${tema.text}`}>🎨 Avatar Seç</h3>
            <button onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
          </div>

          <div className="flex justify-center gap-2 mb-4">
            {['erkek', 'kadin', 'fantastik'].map(kat => (
              <button
                key={kat}
                onClick={() => setAvatarKategori(kat)}
                className={`w-12 h-12 rounded-xl text-2xl transition-all ${
                  avatarKategori === kat
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg scale-110'
                    : tema.inputBg
                }`}
              >
                {kat === 'erkek' ? '👨' : kat === 'kadin' ? '👩' : '🦄'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto mb-4">
            {avatarlar[avatarKategori].map((avatar, i) => (
              <button
                key={i}
                onClick={() => setSeciliAvatar(avatar)}
                className={`w-14 h-14 rounded-2xl text-3xl flex items-center justify-center transition-all ${
                  seciliAvatar === avatar
                    ? 'bg-gradient-to-br from-orange-400 to-amber-400 shadow-lg scale-110 ring-4 ring-orange-300'
                    : `${tema.inputBg} ${tema.bgHover}`
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setKullanici(prev => ({ ...prev, avatar: seciliAvatar }));
              setModalAcik(null);
              bildirimGoster('Avatar güncellendi! ✨');
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold shadow-lg"
          >
            Kaydet
          </button>
        </div>
      </div>
    );
  };

  // ============================================
  // KOMPONENTLER
  // ============================================

  const Bildirim = () => {
    if (!bildirim) return null;
    return (
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl animate-bounce-in backdrop-blur-lg ${
        bildirim.tip === 'basari' 
          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' 
          : 'bg-red-500/90 text-white'
      }`}>
        <div className="flex items-center gap-2">
          <span>{bildirim.tip === 'basari' ? '✨' : '⚠️'}</span>
          {bildirim.mesaj}
        </div>
      </div>
    );
  };

  // YENİ HEADER - Sola yaslı, daha büyük
  const Header = () => (
    <header className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 text-white shadow-2xl sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        {/* Sol: İsim (Sola yaslı, büyük) */}
        <div>
          <h1 
            className="text-4xl font-black tracking-tight leading-none"
            style={{ 
              fontFamily: "'Nunito', sans-serif",
              textShadow: '2px 2px 4px rgba(0,0,0,0.15)'
            }}
          >
            Buluşak
          </h1>
          <p className="text-sm text-white/80 font-medium">planla, buluş, yaşa</p>
        </div>
        
        {/* Sağ: Butonlar */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setModalAcik('bildirimler')}
            className="relative w-11 h-11 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
          >
            🔔
            {bildirimler.filter(b => !b.okundu).length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                {bildirimler.filter(b => !b.okundu).length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setCanSikildiModu(!canSikildiModu)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              canSikildiModu 
                ? 'bg-white text-orange-500 shadow-lg' 
                : 'bg-white/20 backdrop-blur-lg hover:bg-white/30'
            }`}
          >
            {canSikildiModu ? '🔥' : '😴'}
          </button>
        </div>
      </div>
    </header>
  );

  const AltNav = () => (
    <nav className={`fixed bottom-0 left-0 right-0 ${tema.bgCard} border-t ${tema.border} shadow-2xl z-40`}>
      <div className="max-w-lg mx-auto flex justify-around py-2">
        {[
          { id: 'feed', icon: '🏠', label: 'Akış' },
          { id: 'takvim', icon: '📅', label: 'Takvim' },
          { id: 'yeni', icon: '➕', label: 'Yeni', special: true },
          { id: 'planlar', icon: '📋', label: 'Planlar' },
          { id: 'profil', icon: '👤', label: 'Profil' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'yeni') {
                setModalAcik('hizliPlan');
              } else {
                setAktifSayfa(item.id);
              }
            }}
            className={`relative flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-300 ${
              item.special
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg -mt-4 scale-110'
                : aktifSayfa === item.id 
                  ? 'text-orange-500 bg-orange-100 scale-105' 
                  : `${tema.textSecondary} ${tema.bgHover}`
            }`}
          >
            <span className={item.special ? 'text-2xl' : 'text-xl'}>{item.icon}</span>
            <span className="text-xs mt-1 font-semibold">{item.label}</span>
            {item.id === 'planlar' && katilimIstekleri.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {katilimIstekleri.length}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );

  const TakvimHucresi = ({ gun, saat }) => {
    const key = `${gun.toDateString()}-${saat}`;
    const musait = musaitlikler[key];
    const gecmisMi = gun < bugun && gun.toDateString() !== bugun.toDateString();
    const etkinliklerBurada = etkinlikBul(gun, saat);
    const etkinlikVar = etkinliklerBurada.length > 0;

    return (
      <button
        onClick={() => {
          if (!gecmisMi) {
            if (etkinlikVar) {
              setSeciliEtkinlik(etkinliklerBurada[0]);
              setModalAcik('detay');
            } else if (seciliGrup) {
              setSeciliZaman({ tarih: gun, saat });
              setModalAcik('yeniPlan');
            } else {
              musaitlikToggle(gun, saat);
            }
          }
        }}
        disabled={gecmisMi}
        className={`relative h-12 rounded-xl transition-all duration-300 text-xs font-medium overflow-hidden ${
          gecmisMi 
            ? 'bg-gray-100 cursor-not-allowed opacity-40' 
            : etkinlikVar
              ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
              : musait 
                ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md hover:shadow-lg hover:scale-105' 
                : 'bg-white hover:bg-orange-50 border border-orange-100'
        }`}
      >
        {etkinlikVar && <span className="text-lg">{etkinlikIkonlari[etkinliklerBurada[0].ikon]}</span>}
        {!etkinlikVar && musait && <span>✓</span>}
      </button>
    );
  };

  const HaftalikTakvim = () => (
    <div className={`${tema.bgCard} rounded-3xl p-4 ${tema.cardShadow} mx-4 mt-4 border ${tema.border}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-black text-lg ${tema.text}`}>
            {seciliGrup ? `${seciliGrup.emoji} ${seciliGrup.isim}` : '📅 Takvimin'}
          </h3>
          <p className={`text-sm ${tema.textSecondary}`}>{aylar[bugun.getMonth()]} {bugun.getFullYear()}</p>
        </div>
        {seciliGrup && (
          <button 
            onClick={() => setSeciliGrup(null)}
            className={`${tema.inputBg} ${tema.text} px-3 py-1.5 rounded-lg text-sm font-medium`}
          >
            ✕ Kapat
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-8 gap-2 mb-3">
        <div className={`text-xs ${tema.textMuted} text-center py-2 font-bold`}>⏰</div>
        {haftaninGunleri.map((gun, i) => {
          const bugunMu = gun.toDateString() === bugun.toDateString();
          return (
            <div 
              key={i} 
              className={`text-center py-2 rounded-xl transition-all ${
                bugunMu ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg scale-105' : ''
              }`}
            >
              <div className={`text-xs font-bold ${bugunMu ? 'text-white' : tema.textSecondary}`}>{gunler[gun.getDay()]}</div>
              <div className={`text-lg font-black ${bugunMu ? 'text-white' : tema.text}`}>{gun.getDate()}</div>
            </div>
          );
        })}
      </div>

      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {saatler.map(saat => (
          <div key={saat} className="grid grid-cols-8 gap-2 mb-2">
            <div className={`text-xs ${tema.textMuted} text-center py-3 font-medium`}>{saat}</div>
            {haftaninGunleri.map((gun, i) => (
              <TakvimHucresi key={i} gun={gun} saat={saat} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const ActivityPost = ({ aktivite }) => {
    const [reactMenuAcik, setReactMenuAcik] = useState(false);
    const animasyonAktif = animasyonluKart === aktivite.id;

    return (
      <div className={`${tema.bgCard} p-4 border-b ${tema.border} transition-all duration-500 ${
        animasyonAktif ? 'animate-fly-away opacity-0 scale-75' : ''
      }`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-2xl">
            {aktivite.kullanici.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-bold ${tema.text}`}>{aktivite.kullanici.isim}</span>
              {aktivite.kullanici.online && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
            </div>
            <span className={`text-sm ${tema.textSecondary}`}>{aktivite.zaman}</span>
          </div>
        </div>

        <div className={`${tema.inputBg} rounded-2xl p-4 mb-3`}>
          {aktivite.tip === 'yeni_plan' && (
            <div>
              <p className={`${tema.textSecondary} text-sm mb-2`}>yeni bir plan oluşturdu 🎉</p>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center text-3xl">
                  {etkinlikIkonlari[aktivite.plan.ikon]}
                </div>
                <div>
                  <h4 className={`font-bold ${tema.text}`}>{aktivite.plan.baslik}</h4>
                  <p className={`text-sm ${tema.textSecondary}`}>{aktivite.plan.tarih}</p>
                </div>
              </div>
              {aktivite.kullanici.id === (kullanici?.id || 1) ? (
  <div className="w-full mt-3 bg-gray-100 text-gray-500 py-2.5 rounded-xl font-bold text-center">
    📌 Senin Planın
  </div>
) : (
  <button 
    onClick={() => katilimIstegiGonder(aktivite.id, aktivite.plan)}
    disabled={animasyonAktif}
    className={`w-full mt-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-xl font-bold transition-all ${
      animasyonAktif ? 'opacity-50' : 'hover:shadow-lg hover:scale-[1.02]'
    }`}
  >
    {animasyonAktif ? '✓ Gönderildi!' : 'Katılmak İstiyorum! 🙋'}
  </button>
)}
            </div>
          )}

          {aktivite.tip === 'katilim' && (
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <p className={tema.text}>
                <span className="font-bold">{aktivite.plan.baslik}</span> planına katılıyor
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {aktivite.reactler.length > 0 && (
              <div className="flex items-center">
                <div className="flex -space-x-1">
                  {aktivite.reactler.slice(0, 3).map((r, i) => (
                    <span key={i} className={`w-7 h-7 ${tema.inputBg} rounded-full flex items-center justify-center text-sm border-2 border-white`}>
                      {r.emoji}
                    </span>
                  ))}
                </div>
                <span className={`text-sm ${tema.textSecondary} ml-2`}>
                  {aktivite.reactler.reduce((acc, r) => acc + r.kullanicilar.length, 0)}
                </span>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setReactMenuAcik(!reactMenuAcik)}
              className={`${tema.inputBg} px-4 py-2 rounded-full text-sm font-medium ${tema.text} ${tema.bgHover} transition-all`}
            >
              {reactMenuAcik ? '✕' : '😊 Tepki'}
            </button>

            {reactMenuAcik && (
              <div className={`absolute bottom-full right-0 mb-2 ${tema.bgCard} rounded-2xl p-2 shadow-xl border ${tema.border} flex gap-1 animate-scale-in`}>
                {reactEmojiler.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      reactEkle(aktivite.id, emoji);
                      setReactMenuAcik(false);
                    }}
                    className={`w-10 h-10 rounded-xl text-xl ${tema.bgHover} transition-all hover:scale-125`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CanSikildiModuBanner = () => (
    <div className="mx-4 mt-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-gradient-x rounded-3xl"></div>
      <div className="relative bg-black/20 backdrop-blur-sm text-white p-5 rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-xl flex items-center gap-2">
              <span className="animate-bounce">🔥</span> Şu an müsaitsin!
            </h3>
            <p className="text-sm opacity-90 mt-1">Yakınındaki arkadaşların bunu görüyor</p>
          </div>
          <div className="text-right bg-white/20 rounded-2xl px-4 py-2">
            <div className="text-3xl font-black">{demoKullanicilar.filter(k => k.online).length}</div>
            <div className="text-xs">müsait</div>
          </div>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {demoKullanicilar.filter(k => k.online).slice(0, 3).map(k => (
            <div key={k.id} className="bg-white/20 backdrop-blur-lg rounded-full px-4 py-2 text-sm flex items-center gap-2 border border-white/30">
              <span className="text-lg">{k.avatar}</span>
              <span className="font-medium">{k.isim}</span>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            </div>
          ))}
        </div>
        <button 
          onClick={() => setModalAcik('hizliPlan')}
          className="w-full mt-4 bg-white text-orange-600 font-black py-3 rounded-2xl hover:bg-orange-50 transition-all shadow-lg"
        >
          Hadi Buluşalım! 🚀
        </button>
      </div>
    </div>
  );

  // ============================================
  // SAYFALAR
  // ============================================

  const ActivityFeed = () => (
    <div className="pb-24">
      {/* Stories - DÜZELTİLDİ (taşma yok, border yerine box-shadow) */}
      <div className={`${tema.bgCard} border-b ${tema.border} p-4 overflow-hidden`}>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* Sen */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-3xl shadow-lg">
                {kullanici?.avatar || '👨'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm border-2 border-white shadow">
                +
              </div>
            </div>
            <span className={`text-xs mt-2 ${tema.text} font-semibold`}>Sen</span>
          </div>
          
          {/* Diğer Kullanıcılar - DÜZELTME: ring yerine border kullanıldı */}
          {demoKullanicilar.slice(1).map(k => (
            <div key={k.id} className="flex flex-col items-center flex-shrink-0">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                k.online 
                  ? 'border-[3px] border-orange-500 shadow-lg shadow-orange-200' 
                  : `${tema.inputBg} border-2 border-gray-200`
              }`}>
                {k.avatar}
              </div>
              <span className={`text-xs mt-2 ${tema.textSecondary} truncate w-16 text-center font-medium`}>{k.isim}</span>
            </div>
          ))}
        </div>
      </div>

      {canSikildiModu && <CanSikildiModuBanner />}

      {/* Faz 2 Butonları */}
      <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setModalAcik('bucketList')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${tema.bgCard} ${tema.text} ${tema.cardShadow} whitespace-nowrap border ${tema.border}`}
        >
          📋 Bucket List
        </button>
        <button 
          onClick={() => setModalAcik('galeri')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${tema.bgCard} ${tema.text} ${tema.cardShadow} whitespace-nowrap border ${tema.border}`}
        >
          📸 Anılar
        </button>
        <button 
          onClick={() => setModalAcik('yeniGrup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${tema.bgCard} ${tema.text} ${tema.cardShadow} whitespace-nowrap border ${tema.border}`}
        >
          👥 Yeni Grup
        </button>
      </div>

      {/* Activity Posts */}
      <div>
        {aktiviteler.map(aktivite => (
          <ActivityPost key={aktivite.id} aktivite={aktivite} />
        ))}
      </div>
    </div>
  );

  const TakvimSayfasi = () => (
    <div className="pb-24">
      {seciliGrup && (
        <div className="bg-orange-50 p-4 flex items-center justify-between">
          <span className={`flex items-center gap-2 ${tema.text} font-bold`}>
            {seciliGrup.emoji} {seciliGrup.isim}
          </span>
          <span className={`text-sm ${tema.textSecondary}`}>Bir zaman seçerek plan oluştur</span>
        </div>
      )}
      
      <HaftalikTakvim />

      {!seciliGrup && (
        <div className="p-4 space-y-3">
          <div className={`${tema.bgCard} rounded-2xl p-4 border ${tema.border}`}>
            <h4 className={`font-bold ${tema.text} mb-2`}>💡 Nasıl Kullanılır?</h4>
            <ul className={`text-sm ${tema.textSecondary} space-y-1`}>
              <li>• Müsait olduğun zamanlara tıkla ✓</li>
              <li>• Turuncu = mevcut planlar</li>
              <li>• Aşağıdan grup seç, takvimden plan oluştur</li>
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <h4 className={`font-bold ${tema.text}`}>👥 Gruplarını Seç</h4>
            <button 
              onClick={() => setModalAcik('yeniGrup')}
              className="text-orange-500 text-sm font-bold"
            >
              + Yeni Grup
            </button>
          </div>
          <div className="space-y-2">
            {gruplar.map(grup => (
              <button
                key={grup.id}
                onClick={() => setSeciliGrup(grup)}
                className={`w-full ${tema.bgCard} rounded-xl p-3 ${tema.cardShadow} border ${tema.border} flex items-center gap-3 text-left ${tema.bgHover} transition-all`}
              >
                <span className="text-2xl">{grup.emoji}</span>
                <div className="flex-1">
                  <span className={`font-bold ${tema.text}`}>{grup.isim}</span>
                  <span className={`text-sm ${tema.textSecondary} ml-2`}>{grup.uyeler.length} kişi</span>
                </div>
                <span className="text-orange-500">→</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const PlanlarSayfasi = () => (
    <div className="pb-24 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-black ${tema.text}`}>📋 Planların</h2>
        <button 
          onClick={() => setModalAcik('hizliPlan')}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg"
        >
          + Yeni Plan
        </button>
      </div>

      {katilimIstekleri.length > 0 && (
        <div className="mb-4">
          <h3 className={`font-bold ${tema.textSecondary} mb-2`}>⏳ Onay Bekleyenler</h3>
          {katilimIstekleri.map(istek => (
            <div key={istek.id} className={`${tema.bgCard} rounded-xl p-3 border ${tema.border} mb-2 flex items-center gap-3`}>
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-xl">
                {etkinlikIkonlari[istek.plan.ikon]}
              </div>
              <div className="flex-1">
                <div className={`font-bold ${tema.text}`}>{istek.plan.baslik}</div>
                <div className={`text-sm text-yellow-600`}>⏳ Onay bekleniyor...</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {etkinlikler.length > 0 ? (
        <div className="space-y-3">
          {etkinlikler.map(etkinlik => {
            const tarih = new Date(etkinlik.tarih);
            const varimSayisi = etkinlik.katilimcilar.filter(k => k.durum === 'varim').length;
            
            return (
              <button
                key={etkinlik.id}
                onClick={() => {
                  setSeciliEtkinlik(etkinlik);
                  setModalAcik('detay');
                }}
                className={`w-full ${tema.bgCard} rounded-2xl p-4 ${tema.cardShadow} border ${tema.border} text-left ${tema.bgHover} transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center text-3xl shadow-md">
                    {etkinlikIkonlari[etkinlik.ikon]}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${tema.text}`}>{etkinlik.baslik}</h4>
                    <p className={`text-sm ${tema.textSecondary}`}>
                      {etkinlik.grup.emoji} {etkinlik.grup.isim}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-500">{etkinlik.saat}</div>
                    <div className={`text-xs ${tema.textSecondary}`}>
                      {gunler[tarih.getDay()]}, {tarih.getDate()} {aylar[tarih.getMonth()].slice(0, 3)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {etkinlik.katilimcilar.slice(0, 4).map((k, i) => (
                      <div 
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-white ${
                          k.durum === 'varim' ? 'bg-green-100' :
                          k.durum === 'bakariz' ? 'bg-yellow-100' :
                          tema.inputBg
                        }`}
                      >
                        {k.kullanici.avatar}
                      </div>
                    ))}
                  </div>
                  <div className={`text-sm font-medium ${tema.textSecondary}`}>
                    <span className="text-green-500">{varimSayisi}</span>/{etkinlik.katilimcilar.length} katılıyor
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className={`${tema.bgCard} rounded-2xl p-8 text-center border ${tema.border}`}>
          <span className="text-6xl">📅</span>
          <p className={`${tema.text} font-bold mt-4`}>Henüz plan yok</p>
          <p className={`${tema.textSecondary} text-sm mt-1`}>İlk planını oluşturmak için + butonuna tıkla!</p>
        </div>
      )}
    </div>
  );

  const ProfilSayfasi = () => (
    <div className="pb-24 p-4">
      <div className={`${tema.bgCard} rounded-3xl p-6 ${tema.cardShadow} text-center mb-4 border ${tema.border}`}>
        <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-amber-400 rounded-3xl mx-auto flex items-center justify-center text-6xl shadow-xl">
          {kullanici?.avatar || '👨'}
        </div>
        <h2 className={`text-2xl font-black ${tema.text} mt-4`}>{kullanici?.isim || 'Kullanıcı'}</h2>
        <p className={tema.textSecondary}>{kullanici?.kullaniciAdi || '@kullanici'}</p>
        
        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <div className="text-3xl font-black text-orange-500">{etkinlikler.length}</div>
            <div className={`text-xs ${tema.textSecondary}`}>Plan</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-orange-500">{gruplar.length}</div>
            <div className={`text-xs ${tema.textSecondary}`}>Grup</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-green-500">89%</div>
            <div className={`text-xs ${tema.textSecondary}`}>Güvenilirlik</div>
          </div>
        </div>

        <button 
          onClick={() => setModalAcik('avatarDegistir')}
          className={`mt-4 ${tema.inputBg} ${tema.text} px-4 py-2 rounded-xl text-sm font-medium border ${tema.border}`}
        >
          🎨 Avatarı Değiştir
        </button>
      </div>

      <div className={`${tema.bgCard} rounded-3xl p-5 ${tema.cardShadow} mb-4 border ${tema.border}`}>
        <h3 className={`font-black ${tema.text} mb-3`}>🏆 Rozetlerin</h3>
        <div className="flex flex-wrap gap-2">
          <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl text-sm font-bold">🎯 Plan Adamı</span>
          <span className="bg-green-100 text-green-600 px-4 py-2 rounded-xl text-sm font-bold">✓ Güvenilir</span>
          <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold">🚀 Erken Kullanıcı</span>
        </div>
      </div>

      <div className={`${tema.bgCard} rounded-3xl ${tema.cardShadow} overflow-hidden border ${tema.border}`}>
        {[
          { icon: '🔔', text: 'Bildirimler', action: () => setModalAcik('bildirimler') },
          { icon: '📋', text: 'Bucket List', action: () => setModalAcik('bucketList') },
          { icon: '📸', text: 'Anılar', action: () => setModalAcik('galeri') },
          { icon: '👥', text: 'Gruplarım', action: () => setAktifSayfa('takvim') },
        ].map((item, i) => (
          <button 
            key={i}
            onClick={item.action}
            className={`w-full p-4 flex items-center justify-between ${tema.bgHover} transition-all border-b ${tema.border} last:border-b-0`}
          >
            <span className={`flex items-center gap-3 ${tema.text}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.text}</span>
            </span>
            <span className={tema.textSecondary}>→</span>
          </button>
        ))}
        <button 
          onClick={() => {
            setGirisYapildi(false);
            setKayitAsamasi('giris');
          }}
          className={`w-full p-4 flex items-center justify-between ${tema.bgHover} transition-all text-red-500`}
        >
          <span className="flex items-center gap-3">
            <span className="text-xl">🚪</span>
            <span className="font-medium">Çıkış Yap</span>
          </span>
          <span>→</span>
        </button>
      </div>
    </div>
  );

  // ============================================
  // RENDER
  // ============================================

  if (!girisYapildi) {
    return (
      <div>
        <style>{globalStyles}</style>
        <Bildirim />
        {kayitAsamasi === 'giris' && <GirisEkrani />}
        {kayitAsamasi === 'avatar' && <AvatarSecimEkrani />}
        {kayitAsamasi === 'bilgi' && <BilgiEkrani />}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${tema.bg} transition-colors duration-300`}>
      <style>{globalStyles}</style>

      <Bildirim />
      <Header />
      
      <main className="custom-scrollbar">
        {aktifSayfa === 'feed' && <ActivityFeed />}
        {aktifSayfa === 'takvim' && <TakvimSayfasi />}
        {aktifSayfa === 'planlar' && <PlanlarSayfasi />}
        {aktifSayfa === 'profil' && <ProfilSayfasi />}
      </main>

      <YeniGrupModal />
      <YeniPlanModal />
      <EtkinlikDetayModal />
      <HizliPlanModal />
      <BucketListModal />
      <BildirimlerModal />
      <GaleriModal />
      <AvatarDegistirModal />
      
      <AltNav />
    </div>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
  
  * {
    font-family: 'Nunito', sans-serif;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  @keyframes bounce-in {
    0% { transform: translate(-50%, -100px); opacity: 0; }
    50% { transform: translate(-50%, 10px); }
    100% { transform: translate(-50%, 0); opacity: 1; }
  }
  
  @keyframes slide-up {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes scale-in {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  @keyframes gradient-x {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes fly-away {
    0% { transform: scale(1) translateX(0); opacity: 1; }
    50% { transform: scale(0.8) translateX(50px); opacity: 0.5; }
    100% { transform: scale(0.5) translateX(100px) translateY(100px); opacity: 0; }
  }
  
  .animate-bounce-in {
    animation: bounce-in 0.5s ease-out;
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
  
  .animate-scale-in {
    animation: scale-in 0.3s ease-out;
  }
  
  .animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 3s ease infinite;
  }
  
  .animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
  }
  
  .animate-fly-away {
    animation: fly-away 0.8s ease-in forwards;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #FB923C, #F59E0B);
    border-radius: 10px;
  }
`;