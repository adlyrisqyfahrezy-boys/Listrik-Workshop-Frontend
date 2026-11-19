import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "../lib/api.js";

const KOSONG = { lokasi: [], meteran: [], ruang: [], perangkat: [] };

export function useInventory(aktif = true, onSesiHabis = () => {}) {
  const [data, setData] = useState(KOSONG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aksiError, setAksiError] = useState(null);
  const sesiHabisRef = useRef(onSesiHabis);
  const sudahMuatRef = useRef(false);

  useEffect(() => {
    sesiHabisRef.current = onSesiHabis;
  }, [onSesiHabis]);

  const muatUlang = useCallback(async (tampilLoading = false) => {
    if (!api.ambilToken()) return;
    if (tampilLoading) setLoading(true);
    setError(null);
    try {
      setData(await api.ambilInventaris());
    } catch (e) {
      if (e instanceof api.SesiHabisError) {
        setData(KOSONG);
        sesiHabisRef.current();
        return;
      }
      setError(e.message || "Gagal memuat data dari backend.");
    } finally {
      if (tampilLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!aktif) {
      sudahMuatRef.current = false;
      setData(KOSONG);
      setError(null);
      setAksiError(null);
      return;
    }
    if (!api.ambilToken()) {
      sudahMuatRef.current = false;
      return;
    }
    if (sudahMuatRef.current) return;
    sudahMuatRef.current = true;
    muatUlang(true);
  }, [aktif, muatUlang]);

  const jalankan = useCallback(
    async (operasi) => {
      setAksiError(null);
      try {
        const hasil = await operasi();
        await muatUlang();
        return hasil;
      } catch (e) {
        if (e instanceof api.SesiHabisError) {
          sesiHabisRef.current();
          return null;
        }
        setAksiError(e.message || "Gagal menyimpan perubahan ke backend.");
        return null;
      }
    },
    [muatUlang]
  );

  const tambahLokasi = (form) => jalankan(() => api.tambahLokasi(form));
  const ubahMaksWatt = (id, maks_watt) => jalankan(() => api.ubahMaksWatt(id, maks_watt));
  const hapusLokasi = (id) => jalankan(() => api.hapusLokasi(id));
  const tambahRuang = (nama_ruang, id_lokasi) =>
    jalankan(() => api.tambahRuang({ nama_ruang, id_lokasi }));
  const hapusRuang = (id) => jalankan(() => api.hapusRuang(id));
  const tambahPerangkat = (form) => jalankan(() => api.tambahPerangkat(form));
  const ubahPerangkat = (id, form) => jalankan(() => api.ubahPerangkat(id, form));
  const hapusPerangkat = (id) => jalankan(() => api.hapusPerangkat(id));

  return {
    ...data,
    loading,
    error,
    aksiError,
    muatUlang,
    tambahLokasi,
    ubahMaksWatt,
    hapusLokasi,
    tambahRuang,
    hapusRuang,
    tambahPerangkat,
    ubahPerangkat,
    hapusPerangkat,
  };
}
