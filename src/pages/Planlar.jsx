import React, { useState, useEffect } from 'react';
import { useAuth, useData, useUI } from '../context';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const etkinlikIkonlari = { 
  kahve: '☕', yemek: '🍕', film: '🎬', spor: '⚽', oyun: '🎮', 
  parti: '🎉', toplanti: '💼', gezi: '🏖️', alisveris: '🛍️', 
  konser: '🎵', diger: '📅' 
};

const Planlar = () => {
  const { kullanici } = useAuth();
  const { etkinlikler, setEtkinlikler } = useData();
  const { setSeciliEtkinlik, setModalAcik, bildirimGoster } = useUI();
  const [aktifMenu, setAktifMenu] = useState(null);

  // ============================================
  // ESKİ PLANLARI OTOMATİK SİL
  // ============================================
  useEffect(() => {
    const eskiPlanlariSil = async () => {
      const simdi = new Date();
      
      for (const etkinlik of etkinlikler) {
        try {
          // Tarih ve saat kontrolü
          const [gun, ay, yil] = etkinlik.tarih.split('/');
          const [saat, dakika] = etkinlik.saat.split(':');
          const planTarihi = new Date(yil, ay - 1, gun, saat, dakika);
          
          // Eğer plan geçmişse sil
          if (planTarihi < simdi) {
            await deleteDoc(doc(db, 'events', etkinlik.id));
            console.log(`Eski plan silindi: ${etkinlik.baslik}`);
          }
        } catch (error) {
          console.error('Plan silme hatası:', error);
        }
      }
    };

    if (etkinlikler.length > 0) {
      eskiPlanlariSil();
    }
  }, [etkinlikler]);

  // Kendi planları
  const benimPlanlarim = etkinlikler.filter(e => e.olusturanId === kullanici?.odUserId);
  
  // Davet edildiği planlar
  const davetEdilenPlanlar = etkinlikler.filter(e => 
    e.olusturanId !== kullanici?.odUserId && 
    (e.davetliler?.includes(kullanici?.odUserId) || 
     e.katilimcilar?.some(k => k.odUserId === kullanici?.odUserId))
  );

  const handlePlanSil = async (etkinlikId) => {
    if (!window.confirm('Bu planı silmek istediğine emin misin?')) return;
    
    try {
      await deleteDoc(doc(db, 'events', etkinlikId));
      bildirimGoster('Plan silindi! 🗑️');
      setAktifMenu(null);
    } catch (error) {
      console.error('Plan silme hatası:', error);
      bildirimGoster('Plan silinemedi!', 'hata');
    }
  };

  const PlanKarti = ({ etkinlik, benimPlanim }) => {
    const katilimci = etkinlik.katilimcilar?.find(k => k.odUserId === kullanici?.odUserId);
    const durum = katilimci?.durum;

    return (
      <div className="glass-card relative hover:scale-[1.02] transition-transform">
        {benimPlanim && (
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={() => setAktifMenu(aktifMenu === etkinlik.id ? null : etkinlik.id)} 
              className="w-8 h-8 rounded-lg glass-panel-hover flex items-center justify-center hover:bg-white/20"
            >
              <span className="text-white text-lg">⋮</span>
            </button>
            {aktifMenu === etkinlik.id && (
              <div className="absolute right-0 top-10 glass-panel rounded-xl py-2 z-20 w-40 shadow-xl border border-white/20 animate-slide-down">
                <button 
                  onClick={() => { 
                    setSeciliEtkinlik(etkinlik); 
                    setModalAcik('detay'); 
                    setAktifMenu(null); 
                  }} 
                  className="w-full px-4 py-2 text-left hover:bg-white/10 text-white flex items-center gap-2 transition-colors"
                >
                  <span>👁️</span> Detay
                </button>
                <button 
                  onClick={() => handlePlanSil(etkinlik.id)} 
                  className="w-full px-4 py-2 text-left hover:bg-red-500/20 text-red-400 flex items-center gap-2 transition-colors"
                >
                  <span>🗑️</span> Sil
                </button>
              </div>
            )}
          </div>
        )}
        
        <button 
          onClick={() => { 
            setSeciliEtkinlik(etkinlik); 
            setModalAcik('detay'); 
          }} 
          className="w-full text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              {etkinlikIkonlari[etkinlik.ikon] || '📅'}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white">{etkinlik.baslik}</h4>
              <p className="text-sm text-white/70">
                {etkinlik.grup?.emoji} {etkinlik.grup?.isim || 'Arkadaş Planı'}
              </p>
            </div>
            {benimPlanim ? (
              <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-1 rounded-lg border border-orange-500/40">
                👑 Senin
              </span>
            ) : durum ? (
              <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                durum === 'varim' ? 'badge-varim' :
                durum === 'bakariz' ? 'badge-bakariz' :
                'badge-yokum'
              }`}>
                {durum === 'varim' ? '✓ Katılıyorsun' : 
                 durum === 'bakariz' ? '🤔 Bakarız' : 
                 '✗ Katılmıyorsun'}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <span>📅 {etkinlik.tarih}</span>
            <span>⏰ {etkinlik.saat}</span>
            {etkinlik.konum && <span>📍 {etkinlik.konum}</span>}
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="pb-24 p-4 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-white">📋 Planlarım</h2>
          <p className="text-sm text-white/60">
            {benimPlanlarim.length + davetEdilenPlanlar.length} aktif plan
          </p>
        </div>
        <button 
          onClick={() => setModalAcik('hizliPlan')} 
          className="glass-button px-4 py-2 text-sm font-bold hover:scale-105 transition-transform"
        >
          + Yeni Plan
        </button>
      </div>

      {/* Oluşturduklarım */}
      {benimPlanlarim.length > 0 && (
        <div className="mb-6 animate-slide-up">
          <h3 className="text-white/70 font-bold mb-3 text-sm flex items-center gap-2">
            <span>🎯</span> OLUŞTURDUKLARIM
          </h3>
          <div className="space-y-3">
            {benimPlanlarim.map(e => (
              <PlanKarti key={e.id} etkinlik={e} benimPlanim={true} />
            ))}
          </div>
        </div>
      )}

      {/* Davet Edildiğim */}
      {davetEdilenPlanlar.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-white/70 font-bold mb-3 text-sm flex items-center gap-2">
            <span>📬</span> DAVET EDİLDİĞİM
          </h3>
          <div className="space-y-3">
            {davetEdilenPlanlar.map(e => (
              <PlanKarti key={e.id} etkinlik={e} benimPlanim={false} />
            ))}
          </div>
        </div>
      )}

      {/* Boş Durum */}
      {benimPlanlarim.length === 0 && davetEdilenPlanlar.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center animate-scale-in">
          <span className="text-7xl mb-6 block">📅</span>
          <h3 className="text-white font-bold text-xl mb-2">Henüz Plan Yok</h3>
          <p className="text-white/60 mb-6">İlk planını oluşturarak başla!</p>
          <button 
            onClick={() => setModalAcik('hizliPlan')} 
            className="glass-button px-8 py-3 text-base"
          >
            ⚡ İlk Planı Oluştur
          </button>
        </div>
      )}
    </div>
  );
};

export default Planlar;
