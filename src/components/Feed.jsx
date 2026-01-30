import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useAuth, useData, useUI, useTheme } from '../context';
import Stories from './Stories';
import EmptyState from './EmptyState';
import { SkeletonCard } from './Skeleton';
import { ClockIcon, LocationIcon, UsersIcon, ChevronRightIcon, BookmarkIcon } from './Icons';
import { KATILIM_DURUMLARI, LOCATION_RADIUS_OPTIONS, POPULAR_LOCATIONS, PLAN_CATEGORIES, CATEGORY_COLORS, DEFAULT_CATEGORY_IMAGES } from '../constants';

const FEED_TABS = [
  { id: 'arkadaslar', label: 'Arkadaşlar' },
  { id: 'kesfet', label: 'Keşfet' }
];

// FAZ 1 - Kategori Chip Bileşeni
const CategoryChip = ({ category, isActive, onClick }) => {
  const colors = CATEGORY_COLORS[category.color] || CATEGORY_COLORS.gold;

  return (
    <button
      onClick={onClick}
      className={`category-chip ${
        isActive
          ? 'category-chip-active'
          : 'category-chip-inactive'
      }`}
    >
      <span>{category.emoji}</span>
      <span>{category.label}</span>
    </button>
  );
};

// FAZ 1 - Kategori Filtreleri Bileşeni
const CategoryFilters = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2 px-4 -mx-4">
      {PLAN_CATEGORIES.map(category => (
        <CategoryChip
          key={category.id}
          category={category}
          isActive={selectedCategory === category.id}
          onClick={() => onSelectCategory(category.id)}
        />
      ))}
    </div>
  );
};

// FAZ 1 - Geliştirilmiş Plan Kartı Bileşeni
const PlanKarti = ({ plan, onClick, showCover = false }) => {
  const { kullanici } = useAuth();
  const { themeClasses, isDark } = useTheme();
  const [bookmarked, setBookmarked] = useState(false);

  const tarih = new Date(plan.startAt || plan.tarih);
  const bugun = new Date();
  const yarin = new Date();
  yarin.setDate(bugun.getDate() + 1);

  const tarihStr = tarih.toDateString() === bugun.toDateString()
    ? 'Bugün'
    : tarih.toDateString() === yarin.toDateString()
    ? 'Yarın'
    : tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

  const katilimci = plan.katilimcilar?.find(k => k.odUserId === kullanici?.odUserId);
  const varimSayisi = plan.katilimcilar?.filter(k => k.durum === KATILIM_DURUMLARI.VARIM).length || 0;
  const katilimcilar = plan.katilimcilar?.filter(k => k.durum === KATILIM_DURUMLARI.VARIM) || [];

  // Plan sahibinin avatar bilgisini bul
  const olusturan = plan.katilimcilar?.find(k => k.odUserId === plan.olusturanId);
  const olusturanAvatar = olusturan?.avatar || plan.olusturanAvatar;

  // FAZ 1 - Kategori bilgisi
  const kategori = PLAN_CATEGORIES.find(c => c.id === plan.kategori) || PLAN_CATEGORIES.find(c => c.id === 'tumu');
  const kategoriColors = CATEGORY_COLORS[kategori?.color] || CATEGORY_COLORS.gold;

  // FAZ 1 - Kapak fotoğrafı (yoksa kategori varsayılan görseli)
  const coverImage = plan.kapaKFotografi || plan.coverImage || DEFAULT_CATEGORY_IMAGES[plan.kategori] || DEFAULT_CATEGORY_IMAGES.default;

  // Bookmark toggle
  const handleBookmark = (e) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
    // TODO: Bookmark servisine kaydet
  };

  // FAZ 1 - Kapak fotoğraflı kart görünümü (Keşfet için)
  if (showCover) {
    return (
      <button
        onClick={onClick}
        className="w-full card-hover overflow-hidden text-left group"
      >
        {/* Kapak Fotoğrafı Alanı */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={coverImage}
            alt={plan.baslik}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = DEFAULT_CATEGORY_IMAGES.default;
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/30 to-transparent" />

          {/* Kategori Badge */}
          {kategori && kategori.id !== 'tumu' && (
            <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold bg-dark-900/80 backdrop-blur-sm text-white border border-dark-700/50 flex items-center gap-1`}>
              <span>{kategori.emoji}</span>
              <span>{kategori.label}</span>
            </div>
          )}

          {/* Bookmark Butonu */}
          <button
            onClick={handleBookmark}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-dark-900/80 backdrop-blur-sm flex items-center justify-center text-white hover:text-gold-500 transition-colors"
          >
            <BookmarkIcon className="w-4 h-4" filled={bookmarked} />
          </button>

          {/* Alt Bilgiler (overlay üstünde) */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-semibold text-white text-base mb-1 line-clamp-1">{plan.baslik}</h3>
            <div className="flex items-center gap-3 text-xs text-dark-300">
              <span className="flex items-center gap-1">
                <ClockIcon className="w-3.5 h-3.5" />
                {tarihStr} · {plan.saat}
              </span>
              {plan.mekan && plan.mekan !== 'Belirtilmedi' && (
                <span className="flex items-center gap-1 truncate">
                  <LocationIcon className="w-3.5 h-3.5" />
                  {plan.mekan}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Alt Bilgi Alanı */}
        <div className="p-3 flex items-center justify-between">
          {/* Katılımcı Avatarları */}
          <div className="flex items-center gap-2">
            <div className="avatar-stack">
              {katilimcilar.slice(0, 3).map((k, i) => (
                <div key={i} className="avatar">
                  {k.avatar || k.isim?.charAt(0)}
                </div>
              ))}
              {varimSayisi > 3 && (
                <div className="avatar avatar-more">
                  +{varimSayisi - 3}
                </div>
              )}
            </div>
            <span className={`text-xs ${themeClasses.textMuted}`}>
              {varimSayisi} katılımcı
            </span>
          </div>

          {/* Katılım Durumu */}
          {katilimci && (
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
              katilimci.durum === KATILIM_DURUMLARI.VARIM
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              {katilimci.durum === KATILIM_DURUMLARI.VARIM ? 'Katılıyorsun' : 'Katılmıyorsun'}
            </span>
          )}
        </div>
      </button>
    );
  }

  // Orijinal kompakt kart görünümü (Arkadaşlar için - mevcut kod korundu)
  return (
    <button
      onClick={onClick}
      className="w-full card-hover p-4 text-left"
    >
      <div className="flex items-start gap-4">
        {/* Plan sahibi avatarı */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center border border-gold-500/20 overflow-hidden">
          {olusturanAvatar ? (
            <img
              src={olusturanAvatar}
              alt="Plan sahibi"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
              <span className={`text-lg font-semibold ${themeClasses.textSecondary}`}>
                {olusturan?.isim?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${themeClasses.text} truncate`}>{plan.baslik}</h3>
            {/* FAZ 1 - Kategori emoji */}
            {kategori && kategori.id !== 'tumu' && (
              <span className="text-sm">{kategori.emoji}</span>
            )}
          </div>
          <p className={`${themeClasses.textMuted} text-sm truncate`}>
            {plan.grup?.isim || 'Arkadaş planı'}
          </p>

          <div className={`flex items-center gap-4 mt-2 text-xs ${themeClasses.textMuted}`}>
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5" />
              {tarihStr} · {plan.saat}
            </span>
            {plan.mekan && plan.mekan !== 'Belirtilmedi' && (
              <span className="flex items-center gap-1 truncate">
                <LocationIcon className="w-3.5 h-3.5" />
                {plan.mekan}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {katilimci && (
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
              katilimci.durum === KATILIM_DURUMLARI.VARIM
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              {katilimci.durum === KATILIM_DURUMLARI.VARIM ? 'Katılıyorsun' : 'Katılmıyorsun'}
            </span>
          )}
          <span className={`flex items-center gap-1 text-xs ${themeClasses.textMuted}`}>
            <UsersIcon className="w-3.5 h-3.5" />
            {varimSayisi}
          </span>
        </div>
      </div>
    </button>
  );
};

// Konum Seçici Bileşeni
const KonumSecici = ({ onClose }) => {
  const { kesfetMerkezKonum, kesfetYaricap, merkezKonumGuncelle, yaricapGuncelle, kesfetYukle } = useData();
  const { themeClasses, isDark } = useTheme();
  const [seciliKonum, setSeciliKonum] = useState(kesfetMerkezKonum);
  const [seciliYaricap, setSeciliYaricap] = useState(kesfetYaricap);

  const handleUygula = () => {
    merkezKonumGuncelle(seciliKonum);
    yaricapGuncelle(seciliYaricap);
    kesfetYukle(true);
    onClose();
  };

  const handleTemizle = () => {
    setSeciliKonum(null);
    merkezKonumGuncelle(null);
    kesfetYukle(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-lg ${isDark ? 'bg-dark-900' : 'bg-white'} rounded-t-3xl max-h-[80vh] flex flex-col animate-slide-up`}>
        <div className={`p-4 border-b ${themeClasses.border} flex items-center justify-between`}>
          <h2 className={`text-lg font-semibold ${themeClasses.text}`}>Konum Ayarları</h2>
          <button onClick={onClose} className={`w-10 h-10 rounded-xl ${isDark ? 'bg-dark-800' : 'bg-gray-100'} flex items-center justify-center`}>
            <span className={themeClasses.textMuted}>✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Yarıçap Seçimi */}
          <div>
            <label className={`text-xs font-medium ${themeClasses.textSecondary} mb-2 block`}>Keşfet Yarıçapı</label>
            <div className="flex gap-2 flex-wrap">
              {LOCATION_RADIUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSeciliYaricap(opt.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    seciliYaricap === opt.value
                      ? 'btn-gold'
                      : isDark ? 'bg-dark-800 text-dark-300 hover:bg-dark-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Merkez Konum Seçimi */}
          <div>
            <label className={`text-xs font-medium ${themeClasses.textSecondary} mb-2 block`}>Merkez Konum</label>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_LOCATIONS.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => setSeciliKonum(loc)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    seciliKonum?.id === loc.id
                      ? 'bg-gold-500/20 border border-gold-500/30'
                      : isDark ? 'bg-dark-800 hover:bg-dark-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LocationIcon className={`w-4 h-4 ${seciliKonum?.id === loc.id ? 'text-gold-500' : themeClasses.textMuted}`} />
                    <span className={`font-medium ${seciliKonum?.id === loc.id ? 'text-gold-500' : themeClasses.text}`}>
                      {loc.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {seciliKonum && (
            <div className={`p-3 rounded-xl ${isDark ? 'bg-gold-500/10' : 'bg-gold-50'} border border-gold-500/20`}>
              <p className="text-sm text-gold-500">
                <LocationIcon className="w-4 h-4 inline mr-1" />
                {seciliKonum.name} merkezli {seciliYaricap} km içindeki planlar gösterilecek
              </p>
            </div>
          )}
        </div>

        <div className={`p-4 border-t ${themeClasses.border} flex gap-2`}>
          <button onClick={handleTemizle} className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-dark-800 text-dark-300' : 'bg-gray-200 text-gray-700'}`}>
            Temizle
          </button>
          <button onClick={handleUygula} className="flex-1 btn-gold py-3 rounded-xl font-semibold">
            Uygula
          </button>
        </div>
      </div>
    </div>
  );
};

const Feed = () => {
  const { kullanici } = useAuth();
  const {
    yukleniyor,
    feedKaynagi, arkadasPlanlar, kesfetPlanlar,
    kesfetDahaVar, kesfetYukleniyor, feedDegistir, kesfetYukle,
    kesfetMerkezKonum, kesfetYaricap, planYaricaptaMi
  } = useData();
  const { setModalAcik, setSeciliEtkinlik } = useUI();
  const { themeClasses, isDark } = useTheme();
  const loaderRef = useRef();
  const [konumSeciciAcik, setKonumSeciciAcik] = useState(false);
  // FAZ 1 - Kategori filtresi state
  const [selectedCategory, setSelectedCategory] = useState('tumu');

  const handlePlanTikla = (plan) => {
    setSeciliEtkinlik(plan);
    setModalAcik('detay');
  };

  useEffect(() => {
    if (feedKaynagi !== 'kesfet' || !kesfetDahaVar || kesfetYukleniyor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          kesfetYukle(false);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [feedKaynagi, kesfetDahaVar, kesfetYukleniyor]);

  const aktivPlanlar = feedKaynagi === 'arkadaslar' ? arkadasPlanlar : kesfetPlanlar;

  // FAZ 1 - Kategori filtresi uygula
  const filteredPlanlar = useMemo(() => {
    if (!aktivPlanlar) return [];
    if (selectedCategory === 'tumu') return aktivPlanlar;
    return aktivPlanlar.filter(plan => plan.kategori === selectedCategory);
  }, [aktivPlanlar, selectedCategory]);

  const siralananPlanlar = [...(filteredPlanlar || [])].sort((a, b) => {
    const aKatilimci = a.katilimcilar?.find(k => k.odUserId === kullanici?.odUserId);
    const bKatilimci = b.katilimcilar?.find(k => k.odUserId === kullanici?.odUserId);
    if (aKatilimci && !bKatilimci) return -1;
    if (!aKatilimci && bKatilimci) return 1;
    return new Date(a.startAt || a.tarih) - new Date(b.startAt || b.tarih);
  });

  const siradakiPlan = feedKaynagi === 'arkadaslar'
    ? siralananPlanlar.find(p => new Date(p.startAt || p.tarih) >= new Date())
    : null;
  const digerPlanlar = siralananPlanlar.filter(p => p.id !== siradakiPlan?.id);

  if (yukleniyor) {
    return (
      <div className="pb-32">
        <Stories />
        <div className="px-4 space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <Stories />

      <div className="px-4 mb-4">
        <div className={`flex gap-2 p-1 ${isDark ? 'bg-dark-800' : 'bg-gray-200'} rounded-xl`}>
          {FEED_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => feedDegistir(tab.id)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                feedKaynagi === tab.id
                  ? 'bg-gold-500 text-dark-900'
                  : isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Keşfet sekmesinde konum filtresi */}
        {feedKaynagi === 'kesfet' && (
          <button
            onClick={() => setKonumSeciciAcik(true)}
            className={`w-full mt-3 p-3 rounded-xl flex items-center justify-between transition-all ${
              kesfetMerkezKonum
                ? 'bg-gold-500/10 border border-gold-500/30'
                : isDark ? 'bg-dark-800 hover:bg-dark-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <LocationIcon className={`w-4 h-4 ${kesfetMerkezKonum ? 'text-gold-500' : themeClasses.textMuted}`} />
              <span className={`text-sm ${kesfetMerkezKonum ? 'text-gold-500 font-medium' : themeClasses.textSecondary}`}>
                {kesfetMerkezKonum ? `${kesfetMerkezKonum.name} · ${kesfetYaricap} km` : 'Konum seç'}
              </span>
            </div>
            <ChevronRightIcon className={`w-4 h-4 ${kesfetMerkezKonum ? 'text-gold-500' : themeClasses.textMuted}`} />
          </button>
        )}

        {/* FAZ 1 - Kategori Filtreleri */}
        <CategoryFilters
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Konum Seçici Modal */}
      {konumSeciciAcik && <KonumSecici onClose={() => setKonumSeciciAcik(false)} />}

      {siradakiPlan && (
        <div className="px-4 mb-6">
          <h2 className={`text-sm font-semibold ${themeClasses.text} mb-3`}>Sıradaki Plan</h2>
          <div className="card p-1 bg-gradient-to-br from-gold-500/10 to-transparent border-gold-500/20">
            <PlanKarti plan={siradakiPlan} onClick={() => handlePlanTikla(siradakiPlan)} />
          </div>
        </div>
      )}

      {digerPlanlar.length > 0 ? (
        <div className="px-4">
          <h2 className={`text-sm font-semibold ${themeClasses.text} mb-3`}>
            {feedKaynagi === 'arkadaslar' ? 'Planlar' : 'Keşfet'}
            {/* FAZ 1 - Filtrelenen kategori sayısını göster */}
            {selectedCategory !== 'tumu' && (
              <span className={`ml-2 text-xs ${themeClasses.textMuted}`}>
                ({digerPlanlar.length} plan)
              </span>
            )}
          </h2>
          <div className="space-y-3">
            {digerPlanlar.map(plan => (
              <PlanKarti
                key={plan.id}
                plan={plan}
                onClick={() => handlePlanTikla(plan)}
                showCover={feedKaynagi === 'kesfet'} // FAZ 1 - Keşfet'te kapak fotoğraflı kart
              />
            ))}
          </div>

          {feedKaynagi === 'kesfet' && kesfetDahaVar && (
            <div ref={loaderRef} className="py-4">
              {kesfetYukleniyor && <SkeletonCard />}
            </div>
          )}
        </div>
      ) : !siradakiPlan && (
        <div className="px-4">
          {feedKaynagi === 'kesfet' && kesfetYukleniyor ? (
            <SkeletonCard />
          ) : (
            <EmptyState
              title={feedKaynagi === 'arkadaslar' ? 'Henüz plan yok' : 'Keşfedilecek plan yok'}
              description={feedKaynagi === 'arkadaslar'
                ? 'İlk planını oluştur ve arkadaşlarını davet et'
                : 'Şu an açık plan bulunmuyor'}
              action={feedKaynagi === 'arkadaslar' ? () => setModalAcik('hizliPlan') : null}
              actionLabel={feedKaynagi === 'arkadaslar' ? 'Plan Oluştur' : null}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;
