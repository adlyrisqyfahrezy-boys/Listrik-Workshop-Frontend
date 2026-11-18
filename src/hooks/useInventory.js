import { useCallback, useEffect, useState } from "react";
import * as api from "../lib/api.js";

const KOSONG = { lokasi: [], meteran: [], ruang: [], perangkat: [] };

export function useInventory() {
  const [data, setData] = useState(KOSONG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aksiError, setAksiError] = useState(null);

  const muatUlang = useCallback(async (tampilLoading = false) => {
    if (tampilLoading) setLoading(true);
    setError(null);
    try {
      setData(await api.ambilInventaris());
    } catch (e) {
      setError(e.message || "Gagal memuat data dari backend.");
    } finally {
      if (tampilLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    muatUlang(true);
  }, [muatUlang]);

  const jalankan = useCallback(
    async (operasi) => {
      setAksiError(null);
      try {
        const hasil = await operasi();
        await muatUlang();
        return hasil;
      } catch (e) {
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
    hapusPerangkat,
  };
}
