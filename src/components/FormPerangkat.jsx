import { useEffect, useState } from "react";

const KOSONG = { nama_perangkat: "", jumlah: "1", uom: "unit", daya: "" };

function nilaiAwalDari(awal) {
  if (!awal) return KOSONG;
  return {
    nama_perangkat: awal.nama_perangkat ?? "",
    jumlah: String(awal.jumlah ?? 1),
    uom: awal.uom ?? "unit",
    daya: String(awal.daya ?? ""),
  };
}

export default function FormPerangkat({
  onTambah,
  onSimpan,
  onBatal,
  awal,
  label = "Tambah",
  disabled = false,
}) {
  const [form, setForm] = useState(() => nilaiAwalDari(awal));
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(nilaiAwalDari(awal));
    setError("");
  }, [awal?.id, awal?.nama_perangkat, awal?.jumlah, awal?.uom, awal?.daya]);

  const ubah = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
  };

  const kirim = async (e) => {
    e.preventDefault();
    const jumlah = Number(form.jumlah);
    const daya = Number(form.daya);
    if (!form.nama_perangkat.trim() || !(jumlah > 0) || !(daya > 0)) {
      setError("Isi nama perangkat, jumlah, dan daya dengan benar.");
      return;
    }
    const data = {
      nama_perangkat: form.nama_perangkat.trim(),
      jumlah,
      uom: form.uom.trim() || "unit",
      daya,
    };
    if (onSimpan) await onSimpan(data);
    else await onTambah(data);
    if (!awal) setForm(KOSONG);
  };

  return (
    <form className="form-baris" onSubmit={kirim}>
      <input
        name="nama_perangkat"
        placeholder="Nama perangkat"
        value={form.nama_perangkat}
        onChange={ubah}
        aria-label="Nama perangkat"
        disabled={disabled}
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
        disabled={disabled}
        required
      />
      <input
        name="uom"
        placeholder="Satuan"
        value={form.uom}
        onChange={ubah}
        aria-label="Satuan (uom)"
        disabled={disabled}
      />
      <input
        name="daya"
        type="number"
        min="1"
        step="any"
        placeholder="Daya (W)"
        value={form.daya}
        onChange={ubah}
        aria-label="Daya per unit (watt)"
        disabled={disabled}
        required
      />
      <button type="submit" disabled={disabled}>
        {label}
      </button>
      {onBatal && (
        <button type="button" className="sekunder" onClick={onBatal} disabled={disabled}>
          Batal
        </button>
      )}
      {error && (
        <p className="login-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
