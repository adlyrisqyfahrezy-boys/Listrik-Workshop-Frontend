import { useState } from "react";

const KOSONG = { nama_perangkat: "", jumlah: "1", uom: "unit", daya: "" };

// Form kecil untuk menambah baris ke tb_perangkat pada satu ruang.
export default function FormPerangkat({ onTambah }) {
  const [form, setForm] = useState(KOSONG);

  const ubah = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const kirim = (e) => {
    e.preventDefault();
    const jumlah = Number(form.jumlah);
    const daya = Number(form.daya);
    if (!form.nama_perangkat.trim() || !(jumlah > 0) || !(daya > 0)) return;
    onTambah({
      nama_perangkat: form.nama_perangkat.trim(),
      jumlah,
      uom: form.uom.trim() || "unit",
      daya,
    });
    setForm(KOSONG);
  };

  return (
    <form className="form-baris" onSubmit={kirim}>
      <input
        name="nama_perangkat"
        placeholder="Nama perangkat"
        value={form.nama_perangkat}
        onChange={ubah}
        aria-label="Nama perangkat"
        required
      />
      <input
        name="jumlah"
        type="number"
        min="1"
        step="1"
        value={form.jumlah}
        onChange={ubah}
        aria-label="Jumlah"
        required
      />
      <input name="uom" placeholder="Satuan" value={form.uom} onChange={ubah} aria-label="Satuan (uom)" />
      <input
        name="daya"
        type="number"
        min="1"
        step="any"
        placeholder="Daya (W)"
        value={form.daya}
        onChange={ubah}
        aria-label="Daya per unit (watt)"
        required
      />
      <button type="submit">Tambah</button>
    </form>
  );
}
