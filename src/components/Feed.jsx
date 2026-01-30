import React, { useRef, useEffect } from 'react';
import { useAuth, useData, useUI, useTheme } from '../context';
import Stories from './Stories';
import EmptyState from './EmptyState';
import { SkeletonCard } from './Skeleton';
import { ClockIcon, LocationIcon, UsersIcon } from './Icons';
import { KATILIM_DURUMLARI } from '../constants';

const FEED_TABS = [
  { id: 'arkadaslar', label: 'Arkadaşlar' },
  { id: 'kesfet', label: 'Keşfet' }
];

const PlanKarti = ({ plan, onClick }) => {
  const { kullanici } = useAuth();
  const { themeClasses, isDark } = useTheme();
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

  // Plan sahibinin avatar bilgisini bul
  const olusturan = plan.katilimcilar?.find(k => k.odUserId === plan.olusturanId);
  const olusturanAvatar = olusturan?.avatar || plan.olusturanAvatar;

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
          <h3 className={`font-semibold ${themeClasses.text} truncate`}>{plan.baslik}</h3>
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

const Feed = () => {
  const { kullanici } = useAuth();
  const {
    yukleniyor,
    feedKaynagi, arkadasPlanlar, kesfetPlanlar,
    kesfetDahaVar, kesfetYukleniyor, feedDegistir, kesfetYukle
  } = useData();
  const { setModalAcik, setSeciliEtkinlik } = useUI();
  const { themeClasses, isDark } = useTheme();
  const loaderRef = useRef();

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

  const siralananPlanlar = [...(aktivPlanlar || [])].sort((a, b) => {
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
      </div>

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
          </h2>
          <div className="space-y-3">
            {digerPlanlar.map(plan => (
              <PlanKarti
                key={plan.id}
                plan={plan}
                onClick={() => handlePlanTikla(plan)}
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
