import React, { useCallback, useRef, useEffect } from 'react';
import { useAuth, useData, useUI } from '../context';
import Stories from './Stories';
import EmptyState from './EmptyState';
import { SkeletonCard } from './Skeleton';
import { ClockIcon, LocationIcon, UsersIcon, ChevronRightIcon } from './Icons';
import Logo from './Logo';

const KATEGORI_IKONLARI = {
  kahve: '/icons/coffee.png',
  yemek: '/icons/food.png',
  film: '/icons/film.png',
  spor: '/icons/sport.png',
  oyun: '/icons/game.png',
  parti: '/icons/party.png',
  toplanti: '/icons/meeting.png',
  gezi: '/icons/travel.png',
  alisveris: '/icons/shopping.png',
  konser: '/icons/music.png',
  diger: '/icons/other.png'
};

const PlanKarti = ({ plan, onClick }) => {
  const { kullanici } = useAuth();
  const tarih = new Date(plan.tarih);
  const bugun = new Date();
  const yarin = new Date();
  yarin.setDate(bugun.getDate() + 1);

  const tarihStr = tarih.toDateString() === bugun.toDateString()
    ? 'Bugün'
    : tarih.toDateString() === yarin.toDateString()
    ? 'Yarın'
    : tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

  const katilimci = plan.katilimcilar?.find(k => k.odUserId === kullanici?.odUserId);
  const varimSayisi = plan.katilimcilar?.filter(k => k.durum === 'varim').length || 0;

  return (
    <button
      onClick={onClick}
      className="w-full card-hover p-4 text-left"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center border border-gold-500/20">
          <div className="w-8 h-8 flex items-center justify-center">
            <Logo size="xs" className="opacity-70" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{plan.baslik}</h3>
          <p className="text-dark-400 text-sm truncate">
            {plan.grup?.isim || 'Arkadaş planı'}
          </p>

          <div className="flex items-center gap-4 mt-2 text-xs text-dark-500">
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
              katilimci.durum === 'varim' 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : katilimci.durum === 'bakariz'
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              {katilimci.durum === 'varim' ? 'Katılıyorsun' : katilimci.durum === 'bakariz' ? 'Belki' : 'Katılmıyorsun'}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-dark-500">
            <UsersIcon className="w-3.5 h-3.5" />
            {varimSayisi}
          </span>
        </div>
      </div>
    </button>
  );
};

const ArkadasKarti = ({ arkadas }) => {
  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0 w-16">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
        arkadas.online 
          ? 'bg-gradient-to-br from-gold-500/30 to-gold-600/20 border-2 border-gold-500/30' 
          : 'bg-dark-700'
      }`}>
        {arkadas.avatar ? (
          <span className="text-2xl">{arkadas.avatar}</span>
        ) : (
          <Logo size="xs" className="opacity-50" />
        )}
      </div>
      <div className="text-center">
        <p className={`text-xs font-medium truncate w-full ${
          arkadas.online ? 'text-white' : 'text-dark-400'
        }`}>
          {arkadas.isim?.split(' ')[0]}
        </p>
        {arkadas.online && (
          <p className="text-[10px] text-emerald-400">Müsait</p>
        )}
      </div>
    </div>
  );
};

const Feed = () => {
  const { kullanici } = useAuth();
  const { etkinlikler, arkadaslar, yukleniyor } = useData();
  const { setModalAcik, setSeciliEtkinlik } = useUI();
  const observerRef = useRef();

  const handlePlanTikla = (plan) => {
    setSeciliEtkinlik(plan);
    setModalAcik('detay');
  };

  const siralananPlanlar = [...(etkinlikler || [])].sort((a, b) => {
    const aKatilimci = a.katilimcilar?.find(k => k.odUserId === kullanici?.odUserId);
    const bKatilimci = b.katilimcilar?.find(k => k.odUserId === kullanici?.odUserId);
    if (aKatilimci && !bKatilimci) return -1;
    if (!aKatilimci && bKatilimci) return 1;
    return new Date(a.tarih) - new Date(b.tarih);
  });

  const siradakiPlan = siralananPlanlar.find(p => new Date(p.tarih) >= new Date());
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

      {arkadaslar?.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-sm font-semibold text-white">Arkadaşlar</h2>
            <button
              onClick={() => setModalAcik('arkadaslar')}
              className="text-xs text-gold-500 font-medium flex items-center gap-1"
            >
              Tümü <ChevronRightIcon className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
            {arkadaslar.slice(0, 8).map(arkadas => (
              <ArkadasKarti key={arkadas.odUserId} arkadas={arkadas} />
            ))}
          </div>
        </div>
      )}

      {siradakiPlan && (
        <div className="px-4 mb-6">
          <h2 className="text-sm font-semibold text-white mb-3">Sıradaki Plan</h2>
          <div className="card p-1 bg-gradient-to-br from-gold-500/10 to-transparent border-gold-500/20">
            <PlanKarti plan={siradakiPlan} onClick={() => handlePlanTikla(siradakiPlan)} />
          </div>
        </div>
      )}

      {digerPlanlar.length > 0 ? (
        <div className="px-4">
          <h2 className="text-sm font-semibold text-white mb-3">Planlar</h2>
          <div className="space-y-3">
            {digerPlanlar.map(plan => (
              <PlanKarti 
                key={plan.id} 
                plan={plan} 
                onClick={() => handlePlanTikla(plan)} 
              />
            ))}
          </div>
        </div>
      ) : !siradakiPlan && (
        <div className="px-4">
          <EmptyState
            title="Henüz plan yok"
            description="İlk planını oluştur ve arkadaşlarını davet et"
            action={() => setModalAcik('hizliPlan')}
            actionLabel="Plan Oluştur"
          />
        </div>
      )}
    </div>
  );
};

export default Feed;
