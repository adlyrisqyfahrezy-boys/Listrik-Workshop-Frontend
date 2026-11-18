import { useLocalStorage } from "./useLocalStorage.js";
import { seedLokasi, seedMeteran, seedRuang, seedPerangkat } from "../data/seed.js";

// Meniru kolom ID auto increment di database: ambil ID terbesar lalu tambah 1.
const nextId = (rows) => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;

// Satu hook yang memegang keempat tabel + semua operasi tambah/hapus.
export function useInventory() {
  const [lokasi, setLokasi] = useLocalStorage("ws.tb_lokasi", seedLokasi);
  const [meteran, setMeteran] = useLocalStorage("ws.tb_meteran", seedMeteran);
  const [ruang, setRuang] = useLocalStorage("ws.tb_ruang", seedRuang);
  const [perangkat, setPerangkat] = useLocalStorage("ws.tb_perangkat", seedPerangkat);

  // ---------- tb_lokasi + tb_meteran ----------
  const tambahLokasi = ({ nama_lokasi, latitude, longitude, nama_meteran, maks_watt }) => {
    const id = nextId(lokasi);
    setLokasi([...lokasi, { id, nama_lokasi, latitude, longitude }]);
    setMeteran([...meteran, { id: nextId(meteran), id_lokasi: id, nama_meteran, maks_watt }]);
    return id;
  };

  const ubahMaksWatt = (id_meteran, maks_watt) => {
    setMeteran(meteran.map((m) => (m.id === id_meteran ? { ...m, maks_watt } : m)));
  };

  // Hapus lokasi sekaligus semua data turunannya (cascade).
  const hapusLokasi = (id_lokasi) => {
    const idRuang = ruang.filter((r) => r.id_lokasi === id_lokasi).map((r) => r.id);
    setPerangkat(perangkat.filter((p) => !idRuang.includes(p.id_ruang)));
    setRuang(ruang.filter((r) => r.id_lokasi !== id_lokasi));
    setMeteran(meteran.filter((m) => m.id_lokasi !== id_lokasi));
    setLokasi(lokasi.filter((l) => l.id !== id_lokasi));
  };

  // ---------- tb_ruang ----------
  const tambahRuang = (nama_ruang, id_lokasi) => {
    setRuang([...ruang, { id: nextId(ruang), nama_ruang, id_lokasi }]);
  };

  const hapusRuang = (id_ruang) => {
    setPerangkat(perangkat.filter((p) => p.id_ruang !== id_ruang));
    setRuang(ruang.filter((r) => r.id !== id_ruang));
  };

  // ---------- tb_perangkat ----------
  const tambahPerangkat = ({ id_ruang, nama_perangkat, jumlah, uom, daya }) => {
    setPerangkat([
      ...perangkat,
      {
        id: nextId(perangkat),
        id_ruang,
        nama_perangkat,
        jumlah,
        uom,
        daya,
        total_daya: jumlah * daya, // kolom total_daya dihitung otomatis
      },
    ]);
  };

  const hapusPerangkat = (id) => {
    setPerangkat(perangkat.filter((p) => p.id !== id));
  };

  return {
    lokasi,
    meteran,
    ruang,
    perangkat,
    tambahLokasi,
    ubahMaksWatt,
    hapusLokasi,
    tambahRuang,
    hapusRuang,
    tambahPerangkat,
    hapusPerangkat,
  };
}
