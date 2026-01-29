import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useData, useUI } from '../context';
import { ChevronLeftIcon, SendIcon, ImageIcon } from './Icons';
import { SkeletonMessage } from './Skeleton';
import { mesajGonder, mesajlariDinle, mesajlariOkunduIsaretle, yaziyorGuncelle } from '../services/dmService';
import Logo from './Logo';
import EmptyState from './EmptyState';

const KonusmaListesi = ({ onKonusmaSecildi }) => {
  const { konusmalar, arkadaslar, yukleniyor } = useData();
  const { kullanici } = useAuth();

  const getKarsiTaraf = (konusma) => {
    const karsiId = konusma.katilimcilar?.find(id => id !== kullanici?.odUserId);
    return arkadaslar?.find(a => a.odUserId === karsiId);
  };

  if (yukleniyor) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="w-12 h-12 rounded-2xl skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 skeleton rounded" />
              <div className="h-3 w-32 skeleton rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!konusmalar?.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <EmptyState
          title="Henüz mesaj yok"
          description="Arkadaşlarınla sohbet etmeye başla"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {konusmalar.map(konusma => {
        const karsiTaraf = getKarsiTaraf(konusma);
        const okunmamis = konusma.sonGonderic !== kullanici?.odUserId && !konusma.okundu;

        return (
          <button
            key={konusma.id}
            onClick={() => onKonusmaSecildi(konusma, karsiTaraf)}
            className="w-full flex items-center gap-3 p-4 hover:bg-dark-800/50 transition-colors border-b border-dark-800/50"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-dark-700 flex items-center justify-center">
                {karsiTaraf?.avatar ? (
                  <span className="text-2xl">{karsiTaraf.avatar}</span>
                ) : (
                  <Logo size="xs" className="opacity-50" />
                )}
              </div>
              {karsiTaraf?.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-dark-900" />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`font-semibold truncate ${okunmamis ? 'text-white' : 'text-dark-300'}`}>
                  {karsiTaraf?.isim || 'Kullanıcı'}
                </p>
                <span className="text-xs text-dark-500 flex-shrink-0">
                  {konusma.sonMesajZamani?.toDate?.()?.toLocaleTimeString?.('tr-TR', { hour: '2-digit', minute: '2-digit' }) || ''}
                </span>
              </div>
              <p className={`text-sm truncate ${okunmamis ? 'text-white font-medium' : 'text-dark-400'}`}>
                {konusma.sonMesaj || 'Sohbet başlat'}
              </p>
            </div>
            {okunmamis && (
              <div className="w-2.5 h-2.5 bg-gold-500 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

const SohbetEkrani = ({ konusma, karsiTaraf, onGeri }) => {
  const { kullanici } = useAuth();
  const { bildirimGoster } = useUI();
  const [mesajlar, setMesajlar] = useState([]);
  const [yeniMesaj, setYeniMesaj] = useState('');
  const [gonderiyor, setGonderiyor] = useState(false);
  const [yaziyor, setYaziyor] = useState(false);
  const scrollRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    if (!konusma?.id) return;
    const unsubscribe = mesajlariDinle(konusma.id, setMesajlar);
    mesajlariOkunduIsaretle(konusma.id, kullanici.odUserId);
    return () => unsubscribe();
  }, [konusma?.id, kullanici?.odUserId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mesajlar]);

  useEffect(() => {
    const karsiYaziyor = konusma?.[`yaziyor_${karsiTaraf?.odUserId}`];
    if (karsiYaziyor) {
      const diff = Date.now() - karsiYaziyor.toDate?.()?.getTime?.();
      setYaziyor(diff < 5000);
    } else {
      setYaziyor(false);
    }
  }, [konusma, karsiTaraf]);

  const handleGonder = async () => {
    if (!yeniMesaj.trim() || gonderiyor) return;
    const mesajMetni = yeniMesaj.trim();
    setYeniMesaj('');
    setGonderiyor(true);

    const optimisticMesaj = {
      id: Date.now(),
      gondericId: kullanici.odUserId,
      icerik: mesajMetni,
      zaman: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      gonderiliyor: true
    };
    setMesajlar(prev => [...prev, optimisticMesaj]);

    const result = await mesajGonder(konusma.id, kullanici, mesajMetni);
    setGonderiyor(false);

    if (!result.success) {
      bildirimGoster('Mesaj gönderilemedi', 'error');
      setMesajlar(prev => prev.filter(m => m.id !== optimisticMesaj.id));
    }
  };

  const handleInputChange = (e) => {
    setYeniMesaj(e.target.value);
    yaziyorGuncelle(konusma.id, kullanici.odUserId, e.target.value.length > 0);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="glass border-b border-dark-700/50 p-4 flex items-center gap-3">
        <button onClick={onGeri} className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center">
          <ChevronLeftIcon className="w-5 h-5 text-white" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center">
          {karsiTaraf?.avatar ? (
            <span className="text-xl">{karsiTaraf.avatar}</span>
          ) : (
            <Logo size="xs" className="opacity-50" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white">{karsiTaraf?.isim || 'Kullanıcı'}</p>
          <p className="text-xs text-dark-400">
            {yaziyor ? (
              <span className="text-gold-500">yazıyor...</span>
            ) : karsiTaraf?.online ? (
              <span className="text-emerald-400">Çevrimiçi</span>
            ) : (
              'Çevrimdışı'
            )}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {mesajlar.map(mesaj => {
          const benimMi = mesaj.gondericId === kullanici?.odUserId;
          return (
            <div key={mesaj.id} className={`flex ${benimMi ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${benimMi ? 'message-bubble-sent' : 'message-bubble-received'} px-4 py-2.5 ${mesaj.gonderiliyor ? 'opacity-70' : ''}`}>
                <p className="text-sm">{mesaj.icerik}</p>
                <div className={`flex items-center gap-1 mt-1 ${benimMi ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[10px] ${benimMi ? 'text-dark-700' : 'text-dark-500'}`}>{mesaj.zaman}</span>
                  {benimMi && mesaj.okundu && <span className="text-[10px] text-dark-700">✓✓</span>}
                </div>
              </div>
            </div>
          );
        })}
        {yaziyor && (
          <div className="flex justify-start">
            <div className="message-bubble-received px-4 py-3">
              <div className="typing-indicator flex gap-1">
                <span className="w-2 h-2 bg-dark-400 rounded-full" />
                <span className="w-2 h-2 bg-dark-400 rounded-full" />
                <span className="w-2 h-2 bg-dark-400 rounded-full" />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 glass border-t border-dark-700/50 safe-bottom">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={yeniMesaj}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && handleGonder()}
            placeholder="Mesaj yaz..."
            className="flex-1 input-dark rounded-full px-4 py-3"
          />
          <button
            onClick={handleGonder}
            disabled={!yeniMesaj.trim() || gonderiyor}
            className="w-12 h-12 btn-gold rounded-full flex items-center justify-center disabled:opacity-50"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Mesajlar = () => {
  const [seciliKonusma, setSeciliKonusma] = useState(null);
  const [karsiTaraf, setKarsiTaraf] = useState(null);

  const handleKonusmaSecildi = (konusma, karsi) => {
    setSeciliKonusma(konusma);
    setKarsiTaraf(karsi);
  };

  if (seciliKonusma) {
    return (
      <SohbetEkrani
        konusma={seciliKonusma}
        karsiTaraf={karsiTaraf}
        onGeri={() => {
          setSeciliKonusma(null);
          setKarsiTaraf(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full pb-32">
      <div className="glass border-b border-dark-700/50 p-4">
        <h1 className="text-xl font-bold text-white">Mesajlar</h1>
      </div>
      <KonusmaListesi onKonusmaSecildi={handleKonusmaSecildi} />
    </div>
  );
};

export default Mesajlar;
