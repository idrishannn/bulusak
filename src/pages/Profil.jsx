import React, { useState } from 'react';
import { useAuth, useUI } from '../context';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const avatarlar = {
  erkek: ['👨', '👨‍🦱', '👨‍🦰', '👨‍🦳', '👨‍🦲', '🧔', '🧔‍♂️', '👱‍♂️', '👨‍🎓', '👨‍💼', '👨‍🔧', '👨‍🍳', '👨‍🎨', '👨‍🚀', '🕵️‍♂️', '👨‍⚕️', '👨‍🏫', '🤴', '🦸‍♂️', '🧙‍♂️'],
  kadin: ['👩', '👩‍🦱', '👩‍🦰', '👩‍🦳', '👱‍♀️', '👩‍🎓', '👩‍💼', '👩‍🔧', '👩‍🍳', '👩‍🎨', '👩‍🚀', '🕵️‍♀️', '👩‍⚕️', '👩‍🏫', '👸', '🦸‍♀️', '🧙‍♀️', '🧕', '👰', '🤱'],
  fantastik: ['🤖', '👽', '👻', '🎃', '😺', '🦊', '🐶', '🐱', '🦁', '🐯', '🐻', '🐼', '🐨', '🐸', '🦄', '🐲', '🦋', '🌸', '⭐', '🌈']
};

const Profil = () => {
  const { kullanici, cikisYap } = useAuth();
  const { bildirimGoster } = useUI();
  
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [isim, setIsim] = useState(kullanici?.isim || '');
  const [bio, setBio] = useState(kullanici?.bio || '');
  const [avatarSecim, setAvatarSecim] = useState(false);
  const [seciliAvatar, setSeciliAvatar] = useState(kullanici?.avatar || '👨');
  const [avatarKategori, setAvatarKategori] = useState('erkek');
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleKaydet = async () => {
    if (!isim.trim()) {
      bildirimGoster('İsim boş olamaz!', 'hata');
      return;
    }

    setYukleniyor(true);
    try {
      await updateDoc(doc(db, 'users', kullanici.odUserId), {
        isim: isim.trim(),
        bio: bio.trim(),
        avatar: seciliAvatar
      });
      
      bildirimGoster('Profil güncellendi! ✅');
      setDuzenlemeModu(false);
      setAvatarSecim(false);
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      bildirimGoster('Güncelleme başarısız!', 'hata');
    }
    setYukleniyor(false);
  };

  const handleCikis = async () => {
    if (window.confirm('Çıkış yapmak istediğine emin misin?')) {
      await cikisYap();
      bildirimGoster('Görüşmek üzere! 👋');
    }
  };

  if (avatarSecim) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 pb-24">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <button 
            onClick={() => setAvatarSecim(false)} 
            className="text-white/70 hover:text-white mb-6 flex items-center gap-2"
          >
            <span>←</span> Geri
          </button>
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Avatar Seç 🎨</h2>
          </div>

          {/* Seçili Avatar Preview */}
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 bg-gradient-to-br from-orange-500 to-amber-400 rounded-3xl flex items-center justify-center text-6xl shadow-xl">
              {seciliAvatar}
            </div>
          </div>

          {/* Kategori Seçimi */}
          <div className="flex justify-center gap-2 mb-4">
            {[
              { key: 'erkek', label: '👨 Erkek' },
              { key: 'kadin', label: '👩 Kadın' },
              { key: 'fantastik', label: '🦄 Fantastik' },
            ].map(kat => (
              <button
                key={kat.key}
                onClick={() => setAvatarKategori(kat.key)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  avatarKategori === kat.key 
                    ? 'bg-orange-500 text-white' 
                    : 'glass-panel text-white/70 hover:bg-white/10'
                }`}
              >
                {kat.label}
              </button>
            ))}
          </div>

          {/* Avatar Grid */}
          <div className="glass-panel rounded-3xl p-4">
            <div className="grid grid-cols-5 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
              {avatarlar[avatarKategori].map((avatar, i) => (
                <button
                  key={i}
                  onClick={() => setSeciliAvatar(avatar)}
                  className={`w-14 h-14 rounded-2xl text-3xl flex items-center justify-center transition-all ${
                    seciliAvatar === avatar 
                      ? 'bg-orange-500 scale-110 ring-4 ring-orange-300' 
                      : 'glass-panel-hover hover:scale-105'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Kaydet Butonu */}
          <button 
            onClick={() => setAvatarSecim(false)} 
            className="w-full glass-button mt-6"
          >
            Tamam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">👤 Profil</h2>
          {!duzenlemeModu && (
            <button 
              onClick={() => setDuzenlemeModu(true)} 
              className="glass-panel-hover px-4 py-2 rounded-xl text-white font-semibold hover:bg-white/15"
            >
              ✏️ Düzenle
            </button>
          )}
        </div>

        {/* Profil Kartı */}
        <div className="glass-card mb-6 text-center">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-amber-400 rounded-3xl flex items-center justify-center text-7xl shadow-xl">
              {duzenlemeModu ? seciliAvatar : kullanici?.avatar}
            </div>
            {duzenlemeModu && (
              <button
                onClick={() => setAvatarSecim(true)}
                className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <span className="text-xl">✏️</span>
              </button>
            )}
          </div>

          {/* İsim */}
          {duzenlemeModu ? (
            <div className="glass-input-group mb-4">
              <input
                type="text"
                value={isim}
                onChange={(e) => setIsim(e.target.value)}
                placeholder="İsim Soyisim"
                className="glass-input text-center text-xl font-bold"
              />
            </div>
          ) : (
            <h3 className="text-2xl font-black text-white mb-1">
              {kullanici?.isim}
            </h3>
          )}

          {/* Kullanıcı Adı */}
          <p className="text-orange-400 mb-4 font-semibold">
            {kullanici?.kullaniciAdi}
          </p>

          {/* Bio */}
          {duzenlemeModu ? (
            <div className="glass-input-group mb-4">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio ekle..."
                rows={3}
                className="glass-input resize-none"
              />
            </div>
          ) : kullanici?.bio ? (
            <p className="text-white/70 text-sm">
              {kullanici.bio}
            </p>
          ) : (
            <p className="text-white/40 text-sm italic">
              Bio eklenmemiş
            </p>
          )}

          {/* Düzenleme Butonları */}
          {duzenlemeModu && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setDuzenlemeModu(false);
                  setIsim(kullanici?.isim || '');
                  setBio(kullanici?.bio || '');
                  setSeciliAvatar(kullanici?.avatar || '👨');
                }}
                className="flex-1 glass-panel-hover py-3 rounded-xl text-white font-bold hover:bg-white/15"
              >
                İptal
              </button>
              <button
                onClick={handleKaydet}
                disabled={yukleniyor}
                className="flex-1 glass-button"
              >
                {yukleniyor ? 'Kaydediliyor...' : '✅ Kaydet'}
              </button>
            </div>
          )}
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-card text-center">
            <div className="text-2xl font-black text-orange-400 mb-1">
              {kullanici?.arkadaslar?.length || 0}
            </div>
            <div className="text-xs text-white/60">Arkadaş</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-2xl font-black text-green-400 mb-1">
              {kullanici?.planSayisi || 0}
            </div>
            <div className="text-xs text-white/60">Plan</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-2xl font-black text-blue-400 mb-1">
              {kullanici?.grupSayisi || 0}
            </div>
            <div className="text-xs text-white/60">Grup</div>
          </div>
        </div>

        {/* Ayarlar */}
        <div className="glass-card space-y-3 mb-6">
          <h4 className="font-bold text-white mb-3">⚙️ Ayarlar</h4>
          
          <button className="w-full flex items-center justify-between p-3 glass-panel-hover rounded-xl hover:bg-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <span className="text-white font-semibold">Bildirimler</span>
            </div>
            <span className="text-white/40">→</span>
          </button>

          <button className="w-full flex items-center justify-between p-3 glass-panel-hover rounded-xl hover:bg-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔒</span>
              <span className="text-white font-semibold">Gizlilik</span>
            </div>
            <span className="text-white/40">→</span>
          </button>

          <button className="w-full flex items-center justify-between p-3 glass-panel-hover rounded-xl hover:bg-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xl">ℹ️</span>
              <span className="text-white font-semibold">Hakkında</span>
            </div>
            <span className="text-white/40">→</span>
          </button>
        </div>

        {/* Çıkış Butonu */}
        <button
          onClick={handleCikis}
          className="w-full glass-panel-hover py-4 rounded-xl text-red-400 font-bold hover:bg-red-500/20 flex items-center justify-center gap-2"
        >
          <span className="text-xl">🚪</span>
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

export default Profil;
