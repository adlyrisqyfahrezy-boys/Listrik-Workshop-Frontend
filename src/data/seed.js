// Data contoh (dummy) yang mengikuti skema DB: INVENTARISASI_WS.
// Nama field sengaja disamakan dengan nama kolom di tabel supaya nanti
// mudah dipetakan kalau sudah ada backend/API.

export const seedLokasi = [
  // tb_lokasi: id, nama_lokasi, latitude, longitude
  { id: 1, nama_lokasi: "Workshop Utama", latitude: -6.2088, longitude: 106.8456 },
];

export const seedMeteran = [
  // tb_meteran: id, id_lokasi, nama_meteran, maks_watt
  { id: 1, id_lokasi: 1, nama_meteran: "Meteran Utama", maks_watt: 6600 },
];

export const seedRuang = [
  // tb_ruang: id, nama_ruang, id_lokasi
  { id: 1, nama_ruang: "Ruang Mesin", id_lokasi: 1 },
  { id: 2, nama_ruang: "Ruang Las", id_lokasi: 1 },
  { id: 3, nama_ruang: "Ruang Kantor", id_lokasi: 1 },
];

export const seedPerangkat = [
  // tb_perangkat: id, id_ruang, nama_perangkat, jumlah, uom, daya, total_daya
  { id: 1, id_ruang: 1, nama_perangkat: "Mesin Bubut", jumlah: 1, uom: "unit", daya: 1500, total_daya: 1500 },
  { id: 2, id_ruang: 1, nama_perangkat: "Bor Duduk", jumlah: 2, uom: "unit", daya: 550, total_daya: 1100 },
  { id: 3, id_ruang: 1, nama_perangkat: "Lampu LED", jumlah: 8, uom: "pcs", daya: 18, total_daya: 144 },
  { id: 4, id_ruang: 2, nama_perangkat: "Mesin Las Inverter", jumlah: 2, uom: "unit", daya: 1800, total_daya: 3600 },
  { id: 5, id_ruang: 3, nama_perangkat: "Komputer", jumlah: 3, uom: "unit", daya: 120, total_daya: 360 },
  { id: 6, id_ruang: 3, nama_perangkat: "AC 1 PK", jumlah: 1, uom: "unit", daya: 800, total_daya: 800 },
];
