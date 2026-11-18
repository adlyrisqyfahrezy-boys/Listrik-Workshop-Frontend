import { formatWatt, formatPersen, statusBeban } from "../lib/format.js";

// Kartu ringkasan: total beban semua perangkat vs batas meteran (maks_watt).
export default function RingkasanBeban({ meteran, totalDaya, onUbahMaks }) {
  const maks = meteran?.maks_watt ?? 0;
  const persen = maks > 0 ? (totalDaya / maks) * 100 : 0;
  const status = statusBeban(persen);
  const sisa = maks - totalDaya;

  const ubah = () => {
    const input = window.prompt("Batas daya meteran (watt):", String(maks));
    if (input === null) return;
    const nilai = Number(input);
    if (Number.isFinite(nilai) && nilai > 0) onUbahMaks(nilai);
  };

  return (
    <div className="kartu">
      <div className="kartu-judul">
        <h2>{meteran ? meteran.nama_meteran : "Belum ada meteran"}</h2>
        {meteran && (
          <button className="link" onClick={ubah}>
            Ubah batas
          </button>
        )}
      </div>

      <div className="statistik">
        <div>
          <span className="label">Total beban terpasang</span>
          <strong>{formatWatt(totalDaya)}</strong>
        </div>
        <div>
          <span className="label">Batas meteran</span>
          <strong>{meteran ? formatWatt(maks) : "-"}</strong>
        </div>
        <div>
          <span className="label">{sisa >= 0 ? "Sisa kapasitas" : "Kelebihan"}</span>
          <strong>{meteran ? formatWatt(Math.abs(sisa)) : "-"}</strong>
        </div>
      </div>

      <div
        className="bar"
        role="progressbar"
        aria-valuenow={Math.round(persen)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Persentase beban terhadap batas meteran"
      >
        <div className={`bar-isi ${status.kelas}`} style={{ width: `${Math.min(persen, 100)}%` }} />
      </div>
      <p className={`status ${status.kelas}`}>
        {formatPersen(persen)} dari batas · {status.teks}
      </p>
      <p className="kecil">
        Total beban adalah jumlah seluruh daya perangkat yang terdaftar (jika semua menyala bersamaan).
      </p>
    </div>
  );
}
