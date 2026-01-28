import { useState, useEffect } from 'react';
import { kullaniciAdiKontrol } from '../services/arkadasService';

const useKullaniciAdiKontrol = (kullaniciAdi) => {
  const [musaitMi, setMusaitMi] = useState(null); // null, true, false
  const [oneriler, setOneriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);

  useEffect(() => {
    // Boşsa veya çok kısaysa işlem yapma
    if (!kullaniciAdi || kullaniciAdi.length < 3) {
      setMusaitMi(null);
      setOneriler([]);
      setHata(null);
      return;
    }

    // DEBOUNCE: Kullanıcı yazmayı bıraksın diye 500ms bekle
    const timeoutId = setTimeout(async () => {
      setYukleniyor(true);
      setHata(null);
      
      const result = await kullaniciAdiKontrol(kullaniciAdi);
      
      if (result.musait) {
        setMusaitMi(true);
        setOneriler([]);
      } else if (result.oneriler) {
        setMusaitMi(false);
        setOneriler(result.oneriler);
      } else if (result.error) {
        setMusaitMi(null);
        setHata(result.error);
      }
      
      setYukleniyor(false);
    }, 500);

    return () => clearTimeout(timeoutId); // Cleanup
  }, [kullaniciAdi]);

  return { musaitMi, oneriler, yukleniyor, hata };
};

export default useKullaniciAdiKontrol;
