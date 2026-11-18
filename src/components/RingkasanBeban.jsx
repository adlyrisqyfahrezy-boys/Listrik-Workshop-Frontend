import { useState } from "react";
import { formatWatt, formatPersen, statusBeban } from "../lib/format.js";
import ModalUbahBatas from "./ModalUbahBatas.jsx";

// Kartu ringkasan: total beban semua perangkat vs batas meteran (maks_watt).
export default function RingkasanBeban({ meteran, totalDaya, onUbahMaks }) {
  const maks = meteran?.maks_watt ?? 0;
  const persen = maks > 0 ? (totalDaya / maks) * 100 : 0;
  const status = statusBeban(persen);
  const sisa = maks - totalDaya;
  const [tampilUbah, setTampilUbah] = useState(false);

  const ubah = () => setTampilUbah(true);
  const batalUbah = () => setTampilUbah(false);
  const simpanUbah = (nilai) => {
    onUbahMaks(nilai);
    setTampilUbah(false);
  };

  return (
    <>
      <div className="kartu kartu-ringkasan">
        <div className="kartu-judul">
          <div className="judul-grup">
            <span className="ikon-kartu" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 18a8 8 0 1 1 16 0" />
                <path d="m12 14 4-4" />
                <circle cx="12" cy="18" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <h2>{meteran ? meteran.nama_meteran : "Belum ada meteran"}</h2>
          </div>
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

      {tampilUbah && (
        <ModalUbahBatas nilaiAwal={maks} onSimpan={simpanUbah} onBatal={batalUbah} />
      )}
    </>
  );
}
