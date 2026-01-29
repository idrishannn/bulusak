import React from 'react';
import { useAuth, useData, useUI } from '../context';
import { ClockIcon, LocationIcon, UsersIcon, TrashIcon, DotsIcon } from './Icons';
import EmptyState from './EmptyState';
import { SkeletonCard } from './Skeleton';
import Logo from './Logo';

const Planlar = () => {
  const { kullanici } = useAuth();
  const { etkinlikler, yukleniyor } = useData();
  const { setSeciliEtkinlik, setModalAcik, bildirimGoster } = useUI();

  const benimPlanlarim = etkinlikler?.filter(e => e.olusturanId === kullanici?.odUserId) || [];

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Planlarım</h1>
          <p className="text-dark-400 text-sm">{benimPlanlarim.length} plan</p>
        </div>
        <button
          onClick={() => setModalAcik('hizliPlan')}
          className="btn-gold px-4 py-2 rounded-xl text-sm font-semibold"
        >
          + Yeni Plan
        </button>
      </div>

      {benimPlanlarim.length > 0 ? (
        <div className="space-y-3">
          {benimPlanlarim.map(plan => {
            const tarih = new Date(plan.tarih);
            const varimSayisi = plan.katilimcilar?.filter(k => k.durum === 'varim').length || 0;

            return (
              <button
                key={plan.id}
                onClick={() => handlePlanTikla(plan)}
                className="w-full card-hover p-4 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center border border-gold-500/20">
                    <Logo size="xs" className="opacity-70" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white truncate">{plan.baslik}</h3>
                      <span className="text-xs text-gold-500 bg-gold-500/10 px-2 py-1 rounded-lg flex-shrink-0">
                        Senin
                      </span>
                    </div>
                    <p className="text-dark-400 text-sm truncate">{plan.grup?.isim || 'Arkadaş planı'}</p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-dark-500">
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
          })}
        </div>
      ) : (
        <EmptyState
          title="Henüz plan oluşturmadın"
          description="İlk planını oluştur ve arkadaşlarını davet et"
          action={() => setModalAcik('hizliPlan')}
          actionLabel="Plan Oluştur"
        />
      )}
    </div>
  );
};

export default Planlar;
