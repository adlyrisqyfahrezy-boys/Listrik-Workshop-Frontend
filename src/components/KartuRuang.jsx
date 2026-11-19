import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import FormPerangkat from "./FormPerangkat.jsx";
import { formatWatt, formatPersen } from "../lib/format.js";

export default function KartuRuang({
  ruang,
  perangkat,
  totalSemua,
  onTambahPerangkat,
  onUbahPerangkat,
  onHapusPerangkat,
  onHapusRuang,
}) {
  const [sedangUbah, setSedangUbah] = useState(null);
  const [menyimpan, setMenyimpan] = useState(false);
  const [errorSimpan, setErrorSimpan] = useState("");

  const totalRuang = perangkat.reduce((jml, p) => jml + p.total_daya, 0);
  const porsi = totalSemua > 0 ? (totalRuang / totalSemua) * 100 : 0;

  useEffect(() => {
    if (!sedangUbah) return;
    const tutupEsc = (e) => {
      if (e.key === "Escape" && !menyimpan) setSedangUbah(null);
    };
    const overflowLama = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", tutupEsc);
    return () => {
      document.body.style.overflow = overflowLama;
      document.removeEventListener("keydown", tutupEsc);
    };
  }, [sedangUbah, menyimpan]);

  const bukaUbah = (p) => {
    setErrorSimpan("");
    setSedangUbah(p);
  };

  const simpanUbah = async (data) => {
    if (!onUbahPerangkat || !sedangUbah) return;
    setMenyimpan(true);
    setErrorSimpan("");
    const hasil = await onUbahPerangkat(sedangUbah.id, { ...data, id_ruang: ruang.id });
    setMenyimpan(false);
    if (hasil != null) setSedangUbah(null);
    else setErrorSimpan("Gagal menyimpan perubahan perangkat.");
  };

  const hapusRuang = () => {
    if (window.confirm(`Hapus ruang "${ruang.nama_ruang}" beserta semua perangkatnya?`)) {
      onHapusRuang(ruang.id);
    }
  };

  return (
    <section className="kartu ruang">
      <div className="kartu-judul">
        <div className="ruang-judul">
          <span className="ikon-kartu" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3 9 5-9 5-9-5 9-5Z" />
              <path d="m3 12 9 5 9-5" />
              <path d="m3 16 9 5 9-5" />
            </svg>
          </span>
          <h3>{ruang.nama_ruang}</h3>
          <span className="badge-jumlah">{perangkat.length} perangkat</span>
        </div>
        <button className="link bahaya-teks" onClick={hapusRuang}>
          Hapus ruang
        </button>
      </div>

      <div className="bagian">
        <div className="bar" role="presentation">
          <div className="bar-isi aksen" style={{ width: `${Math.min(porsi, 100)}%` }} />
        </div>
        <span>{formatPersen(porsi)}</span>
      </div>

      {perangkat.length === 0 ? (
        <p className="kosong">Belum ada perangkat di ruang ini.</p>
      ) : (
        <div className="tabel-wrap">
          <table>
            <thead>
              <tr>
                <th>Perangkat</th>
                <th className="angka">Jumlah</th>
                <th className="angka">Daya/unit</th>
                <th className="angka">Total daya</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {perangkat.map((p) => (
                <tr key={p.id}>
                  <td>{p.nama_perangkat}</td>
                  <td className="angka">
                    {p.jumlah} {p.uom}
                  </td>
                  <td className="angka">{formatWatt(p.daya)}</td>
                  <td className="angka">{formatWatt(p.total_daya)}</td>
                  <td className="aksi">
                    <div className="aksi-perangkat">
                      <button
                        className="link"
                        onClick={() => bukaUbah(p)}
                        aria-label={`Ubah ${p.nama_perangkat}`}
                      >
                        Ubah
                      </button>
                      <button
                        className="link bahaya-teks"
                        onClick={() => onHapusPerangkat(p.id)}
                        aria-label={`Hapus ${p.nama_perangkat}`}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Total ruangan ({formatPersen(porsi)} dari seluruh beban)</td>
                <td className="angka">{formatWatt(totalRuang)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <FormPerangkat onTambah={(data) => onTambahPerangkat({ ...data, id_ruang: ruang.id })} />

      {sedangUbah &&
        createPortal(
          <div
            className="modal-latar"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !menyimpan) setSedangUbah(null);
            }}
          >
            <div
              className="modal-kartu modal-akun modal-perangkat"
              role="dialog"
              aria-modal="true"
              aria-label="Ubah perangkat"
            >
              <div className="modal-akun-header">
                <div>
                  <h2>Ubah perangkat</h2>
                  <p className="kecil">
                    {sedangUbah.nama_perangkat} · {ruang.nama_ruang}
                  </p>
                </div>
                <button
                  type="button"
                  className="modal-tutup"
                  aria-label="Tutup"
                  onClick={() => setSedangUbah(null)}
                  disabled={menyimpan}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-akun-utama">
                <FormPerangkat
                  awal={sedangUbah}
                  label={menyimpan ? "Menyimpan..." : "Simpan perubahan"}
                  disabled={menyimpan}
                  onSimpan={simpanUbah}
                  onBatal={() => setSedangUbah(null)}
                />
              </div>
              {errorSimpan && (
                <p className="login-error" role="alert">
                  {errorSimpan}
                </p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
