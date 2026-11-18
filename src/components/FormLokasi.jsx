import { useState } from "react";

const KOSONG = { nama_lokasi: "", latitude: "", longitude: "", nama_meteran: "Meteran Utama", maks_watt: "" };

// Form tambah lokasi baru (tb_lokasi) sekaligus meteran-nya (tb_meteran).
export default function FormLokasi({ onTambah, onBatal }) {
  const [form, setForm] = useState(KOSONG);

  const ubah = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const kirim = (e) => {
    e.preventDefault();
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const maks_watt = Number(form.maks_watt);
    if (!form.nama_lokasi.trim()) return;
    if (!(latitude >= -90 && latitude <= 90) || !(longitude >= -180 && longitude <= 180)) return;
    if (!(maks_watt > 0)) return;
    onTambah({
      nama_lokasi: form.nama_lokasi.trim(),
      latitude,
      longitude,
      nama_meteran: form.nama_meteran.trim() || "Meteran Utama",
      maks_watt,
    });
    setForm(KOSONG);
  };

  return (
    <form className="form-kolom" onSubmit={kirim}>
      <label>
        Nama lokasi
        <input name="nama_lokasi" value={form.nama_lokasi} onChange={ubah} required />
      </label>
      <div className="dua-kolom">
        <label>
          Latitude
          <input name="latitude" type="number" step="any" placeholder="-6.2088" value={form.latitude} onChange={ubah} required />
        </label>
        <label>
          Longitude
          <input name="longitude" type="number" step="any" placeholder="106.8456" value={form.longitude} onChange={ubah} required />
        </label>
      </div>
      <div className="dua-kolom">
        <label>
          Nama meteran
          <input name="nama_meteran" value={form.nama_meteran} onChange={ubah} />
        </label>
        <label>
          Batas daya (W)
          <input name="maks_watt" type="number" min="1" step="any" placeholder="6600" value={form.maks_watt} onChange={ubah} required />
        </label>
      </div>
      <div className="aksi-form">
        <button type="submit">Simpan lokasi</button>
        <button type="button" className="sekunder" onClick={onBatal}>
          Batal
        </button>
      </div>
    </form>
  );
}
