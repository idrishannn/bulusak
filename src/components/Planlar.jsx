import React, { useState } from 'react';
import { useAuth, useData, useUI, useTheme } from '../context';
import { ClockIcon, UsersIcon } from './Icons';
import EmptyState from './EmptyState';
import { SkeletonCard } from './Skeleton';
import { KATILIM_DURUMLARI } from '../constants';

const PLAN_TABS = [
  { id: 'benim', label: 'Planlarım' },
  { id: 'katildiklari', label: 'Katıldığım Planlar' }
];

const PlanKarti = ({ plan, onClick, benimMi }) => {
  const { themeClasses, isDark } = useTheme();
  const tarih = new Date(plan.startAt || plan.tarih);
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
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-semibold ${themeClasses.text} truncate`}>{plan.baslik}</h3>
            {benimMi && (
              <span className="text-xs text-gold-500 bg-gold-500/10 px-2 py-1 rounded-lg flex-shrink-0">
                Senin
              </span>
            )}
          </div>
          <p className={`${themeClasses.textMuted} text-sm truncate`}>{plan.grup?.isim || 'Arkadaş planı'}</p>

          <div className={`flex items-center gap-4 mt-2 text-xs ${themeClasses.textMuted}`}>
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5" />
              {tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} · {plan.saat}
            </span>
            <span className="flex items-center gap-1">
              <UsersIcon className="w-3.5 h-3.5" />
              {varimSayisi} katılımcı
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

const Planlar = () => {
  const { kullanici } = useAuth();
  const { etkinlikler, yukleniyor } = useData();
  const { setSeciliEtkinlik, setModalAcik } = useUI();
  const { themeClasses, isDark } = useTheme();
  const [aktifTab, setAktifTab] = useState('benim');

  // Benim oluşturduğum planlar
  const benimPlanlarim = etkinlikler?.filter(e => e.olusturanId === kullanici?.odUserId) || [];

  // Katıldığım planlar: Benim oluşturmadığım ama participantIds veya davetliler içinde olduğum
  const katildigimPlanlar = etkinlikler?.filter(e => {
    if (e.olusturanId === kullanici?.odUserId) return false;
    if (e.participantIds?.includes(kullanici?.odUserId)) return true;
    if (e.davetliler?.includes(kullanici?.odUserId)) return true;
    return false;
  }) || [];

  const aktivPlanlar = aktifTab === 'benim' ? benimPlanlarim : katildigimPlanlar;
  const planSayisi = aktifTab === 'benim' ? benimPlanlarim.length : katildigimPlanlar.length;

  const handlePlanTikla = (plan) => {
    setSeciliEtkinlik(plan);
    setModalAcik('detay');
  };

  if (yukleniyor) {
    return (
      <div className="p-4 pb-32 space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="pb-32 p-4">
      <div className="mb-6">
        <h1 className={`text-xl font-bold ${themeClasses.text}`}>Planlarım</h1>
        <p className={`${themeClasses.textMuted} text-sm`}>{planSayisi} plan</p>
      </div>

      {/* Tab bar */}
      <div className={`flex gap-2 p-1 ${isDark ? 'bg-dark-800' : 'bg-gray-200'} rounded-xl mb-4`}>
        {PLAN_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setAktifTab(tab.id)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              aktifTab === tab.id
                ? 'bg-gold-500 text-dark-900'
                : isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {aktivPlanlar.length > 0 ? (
        <div className="space-y-3">
          {aktivPlanlar.map(plan => (
            <PlanKarti
              key={plan.id}
              plan={plan}
              onClick={() => handlePlanTikla(plan)}
              benimMi={plan.olusturanId === kullanici?.odUserId}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={aktifTab === 'benim' ? 'Henüz plan oluşturmadın' : 'Katıldığın plan yok'}
          description={aktifTab === 'benim'
            ? 'İlk planını oluştur ve arkadaşlarını davet et'
            : 'Arkadaşlarının planlarına katılabilirsin'}
          action={aktifTab === 'benim' ? () => setModalAcik('hizliPlan') : null}
          actionLabel={aktifTab === 'benim' ? 'Plan Oluştur' : null}
        />
      )}
    </div>
  );
};

export default Planlar;
