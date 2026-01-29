import React, { useState } from 'react';
import { useAuth, useData, useUI } from '../context';
import { etkinlikSil } from '../services/etkinlikService';

const gunler = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const etkinlikIkonlari = { kahve: '☕', yemek: '🍕', film: '🎬', spor: '⚽', oyun: '🎮', parti: '🎉', toplanti: '💼', gezi: '🏖️', alisveris: '🛍️', konser: '🎵', diger: '📅' };

const Planlar = () => {
  const { kullanici } = useAuth();
  const { etkinlikler } = useData();
  const { katilimIstekleri, setSeciliEtkinlik, setModalAcik, bildirimGoster } = useUI();
  const [aktifMenu, setAktifMenu] = useState(null);

  const benimPlanlarim = etkinlikler.filter(etkinlik => 
    etkinlik.olusturanId === kullanici?.odUserId
  );

  const handlePlanSil = async (etkinlikId) => {
    if (!window.confirm('Bu planı silmek istediğine emin misin?')) {
      return;
    }

    try {
      await etkinlikSil(etkinlikId);
      bildirimGoster('Plan silindi! 🗑️');
      setAktifMenu(null);
    } catch (error) {
      console.error('Plan silme hatası:', error);
      bildirimGoster('Plan silinemedi!', 'hata');
    }
  };

  const handlePlanDuzenle = (etkinlik) => {
    setSeciliEtkinlik(etkinlik);
    setAktifMenu(null);
    bildirimGoster('Plan düzenleme özelliği yakında!');
  };

  return (
    <div className="pb-32 p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">📋 Planlarım</h2>
          <p className="text-sm text-white/60">{benimPlanlarim.length} plan</p>
        </div>
        <button 
          onClick={() => setModalAcik('hizliPlan')}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          + Yeni Plan
        </button>
      </div>

      {katilimIstekleri.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-white/70 mb-3 text-sm">⏳ Onay Bekleyenler</h3>
          {katilimIstekleri.map(istek => (
            <div key={istek.id} className="glass-card rounded-2xl p-3 border border-yellow-500/30 mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center text-xl">
                {etkinlikIkonlari[istek.plan?.ikon] || '📅'}
              </div>
              <div className="flex-1">
                <div className="font-bold text-white text-sm">{istek.plan?.baslik || 'Plan'}</div>
                <div className="text-xs text-yellow-400 font-semibold">⏳ Onay bekleniyor...</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {benimPlanlarim.length > 0 ? (
        <div className="space-y-3">
          {benimPlanlarim.map(etkinlik => {
            const tarih = new Date(etkinlik.tarih);
            const katilimcilar = etkinlik.katilimcilar || [];
            const varimSayisi = katilimcilar.filter(k => k.durum === 'varim').length;
            
            return (
              <div
                key={etkinlik.id}
                className="glass-card rounded-2xl p-4 text-left transition-all relative"
              >
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAktifMenu(aktifMenu === etkinlik.id ? null : etkinlik.id);
                    }}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <span className="text-white/70 text-lg">⋮</span>
                  </button>

                  {aktifMenu === etkinlik.id && (
                    <div className="absolute right-0 top-10 glass-modal rounded-xl shadow-2xl py-2 z-20 w-40 animate-scale-in">
                      <button
                        onClick={() => {
                          setSeciliEtkinlik(etkinlik);
                          setModalAcik('detay');
                          setAktifMenu(null);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2 text-white font-medium"
                      >
                        <span>👁️</span> Detay
                      </button>
                      <button
                        onClick={() => handlePlanDuzenle(etkinlik)}
                        className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2 text-white font-medium"
                      >
                        <span>✏️</span> Düzenle
                      </button>
                      <button
                        onClick={() => handlePlanSil(etkinlik.id)}
                        className="w-full px-4 py-2 text-left hover:bg-red-500/20 transition-colors flex items-center gap-2 text-red-400 font-medium"
                      >
                        <span>🗑️</span> Sil
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSeciliEtkinlik(etkinlik);
                    setModalAcik('detay');
                  }}
                  className="w-full text-left pr-12"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                      {etkinlikIkonlari[etkinlik.ikon]}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{etkinlik.baslik}</h4>
                      <p className="text-sm text-white/60">
                        {etkinlik.grup?.emoji} {etkinlik.grup?.isim || 'Arkadaş Planı'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-orange-400">{etkinlik.saat}</div>
                      <div className="text-xs text-white/50">
                        {gunler[tarih.getDay()]}, {tarih.getDate()} {aylar[tarih.getMonth()]?.slice(0, 3)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <div className="text-sm text-white/60">
                      <span className="text-green-400 font-bold">{varimSayisi}</span>/{katilimcilar.length} katılıyor
                    </div>
                    
                    <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-1 rounded-lg border border-orange-500/30">
                      👑 Senin
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-8 text-center border border-white/10">
          <span className="text-6xl">📅</span>
          <p className="text-white font-bold mt-4">Henüz plan yok</p>
          <p className="text-white/60 text-sm mt-1">İlk planını oluşturmak için + butonuna tıkla!</p>
          <button
            onClick={() => setModalAcik('hizliPlan')}
            className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95"
          >
            ⚡ İlk Planı Oluştur
          </button>
        </div>
      )}
    </div>
  );
};

export default Planlar;
