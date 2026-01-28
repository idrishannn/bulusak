import React, { useState, useEffect } from 'react';
import { useAuth, useUI } from '../context';
import { kullaniciAra, arkadasIstegiGonder, arkadasSil } from '../services/arkadasService';

const ArkadaslarModal = () => {
  const { kullanici } = useAuth();
  const { modalAcik, setModalAcik, bildirimGoster, tema } = useUI();
  
  const [aktifTab, setAktifTab] = useState('liste'); // 'liste' veya 'ara'
  const [aramaMetni, setAramaMetni] = useState('');
  const [aramaYukleniyor, setAramaYukleniyor] = useState(false);
  const [aramaSonuclari, setAramaSonuclari] = useState([]);
  const [arkadaslar, setArkadaslar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);

  // Modal açıldığında arkadaşları yükle
  useEffect(() => {
    if (modalAcik === 'arkadaslar' && kullanici?.arkadaslar?.length > 0) {
      // Arkadaş listesini yükle (DataContext'ten gelecek)
    }
  }, [modalAcik, kullanici]);

  // Arama (debounce ile)
  useEffect(() => {
    if (!aramaMetni || aramaMetni.length < 2) {
      setAramaSonuclari([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setAramaYukleniyor(true);
      const result = await kullaniciAra(aramaMetni);
      
      if (result.success) {
        // Kendini ve mevcut arkadaşları filtrele
        const filtrelenmis = result.kullanicilar.filter(
          k => k.odUserId !== kullanici?.odUserId
        );
        setAramaSonuclari(filtrelenmis);
      }
      setAramaYukleniyor(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [aramaMetni, kullanici]);

  if (modalAcik !== 'arkadaslar') return null;

  const handleIstekGonder = async (alici) => {
    setYukleniyor(true);
    const result = await arkadasIstegiGonder(kullanici, alici.odUserId);
    setYukleniyor(false);
    
    if (result.success) {
      bildirimGoster(result.message);
      // Arama sonuçlarını güncelle
      setAramaSonuclari(prev => prev.map(k => 
        k.odUserId === alici.odUserId ? { ...k, istekGonderildi: true } : k
      ));
    } else {
      bildirimGoster(result.error, 'hata');
    }
  };

  const handleArkadasSil = async (arkadasId) => {
    if (!window.confirm('Bu kişiyi arkadaşlıktan çıkarmak istediğine emin misin?')) {
      return;
    }
    
    setYukleniyor(true);
    const result = await arkadasSil(kullanici, arkadasId);
    setYukleniyor(false);
    
    if (result.success) {
      bildirimGoster(result.message);
    } else {
      bildirimGoster(result.error, 'hata');
    }
  };

  // Arkadaş mı kontrolü
  const arkadasMi = (userId) => {
    return kullanici?.arkadaslar?.includes(userId);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg animate-slide-up border-t ${tema.border} max-h-[85vh] flex flex-col`}>
        <div className="p-6 border-b border-gray-100">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-black ${tema.text}`}>👥 Arkadaşlar</h3>
            <button 
              type="button" 
              onClick={() => setModalAcik(null)} 
              className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}
            >
              ✕
            </button>
          </div>

          {/* Tab Butonları */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAktifTab('liste')}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                aktifTab === 'liste'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                  : `${tema.inputBg} ${tema.text}`
              }`}
            >
              📋 Arkadaşlarım
            </button>
            <button
              type="button"
              onClick={() => setAktifTab('ara')}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                aktifTab === 'ara'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                  : `${tema.inputBg} ${tema.text}`
              }`}
            >
              🔍 Kişi Ara
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* ARAMA TAB'I */}
          {aktifTab === 'ara' && (
            <>
              <div className="mb-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <input
                    type="text"
                    value={aramaMetni}
                    onChange={(e) => setAramaMetni(e.target.value.replace('@', ''))}
                    placeholder="kullanıcı adı ara..."
                    className={`w-full ${tema.inputBg} ${tema.inputText} rounded-xl p-3 pl-9 focus:outline-none focus:ring-2 focus:ring-orange-400`}
                  />
                  {aramaYukleniyor && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin">⏳</span>
                  )}
                </div>
              </div>

              {/* Arama Sonuçları */}
              {aramaSonuclari.length > 0 ? (
                <div className="space-y-2">
                  {aramaSonuclari.map(kisi => (
                    <div 
                      key={kisi.odUserId} 
                      className={`flex items-center gap-3 p-3 rounded-2xl ${tema.inputBg}`}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center text-2xl">
                        {kisi.avatar || '👤'}
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold ${tema.text}`}>{kisi.isim || 'Kullanıcı'}</div>
                        <div className={`text-sm ${tema.textSecondary}`}>{kisi.kullaniciAdi || '@kullanici'}</div>
                      </div>
                      {arkadasMi(kisi.odUserId) ? (
                        <span className="text-green-500 text-sm font-bold">✓ Arkadaş</span>
                      ) : kisi.istekGonderildi ? (
                        <span className="text-orange-500 text-sm font-bold">⏳ Gönderildi</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleIstekGonder(kisi)}
                          disabled={yukleniyor}
                          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
                        >
                          + Ekle
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : aramaMetni.length >= 2 && !aramaYukleniyor ? (
                <div className="text-center py-8">
                  <span className="text-4xl">🔍</span>
                  <p className={`${tema.textSecondary} mt-2`}>Kullanıcı bulunamadı</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl">👋</span>
                  <p className={`${tema.textSecondary} mt-2`}>Kullanıcı adı yazarak ara</p>
                  <p className={`text-xs ${tema.textMuted} mt-1`}>En az 2 karakter gir</p>
                </div>
              )}
            </>
          )}

          {/* ARKADAŞ LİSTESİ TAB'I */}
          {aktifTab === 'liste' && (
            <>
              {kullanici?.arkadaslarDetay?.length > 0 ? (
                <div className="space-y-2">
                  {kullanici.arkadaslarDetay.map(arkadas => (
                    <div 
                      key={arkadas.odUserId} 
                      className={`flex items-center gap-3 p-3 rounded-2xl ${tema.inputBg}`}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center text-2xl">
                        {arkadas.avatar || '👤'}
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold ${tema.text}`}>{arkadas.isim || 'Kullanıcı'}</div>
                        <div className={`text-sm ${tema.textSecondary}`}>{arkadas.kullaniciAdi || '@kullanici'}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleArkadasSil(arkadas.odUserId)}
                        disabled={yukleniyor}
                        className={`${tema.textMuted} hover:text-red-500 transition-colors p-2`}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-6xl">👥</span>
                  <p className={`${tema.text} font-bold mt-4`}>Henüz arkadaşın yok</p>
                  <p className={`${tema.textSecondary} text-sm mt-1`}>Kişi ara sekmesinden arkadaş ekle!</p>
                  <button
                    type="button"
                    onClick={() => setAktifTab('ara')}
                    className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-xl font-bold"
                  >
                    🔍 Kişi Ara
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArkadaslarModal;
