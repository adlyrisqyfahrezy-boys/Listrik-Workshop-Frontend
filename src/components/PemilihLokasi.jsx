import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function PemilihLokasi({ lokasi, aktif, onPilih }) {
  const [buka, setBuka] = useState(false);
  const [posisi, setPosisi] = useState({ top: 0, left: 0, lebar: 280 });
  const wadah = useRef(null);
  const tombol = useRef(null);
  const menu = useRef(null);

  useEffect(() => {
    if (!buka) return;
    const aturPosisi = () => {
      const el = tombol.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const lebar = Math.min(Math.max(r.width, 280), window.innerWidth - 24);
      const tinggi = lokasi.length * 56 + 12;
      const bawah = r.bottom + 10;
      const top = window.innerHeight - bawah < tinggi && r.top > tinggi ? r.top - tinggi - 10 : bawah;
      setPosisi({
        top: Math.max(12, top),
        left: Math.max(12, Math.min(r.right - lebar, window.innerWidth - lebar - 12)),
        lebar,
      });
    };
    const tutupKlik = (e) => {
      const didalam =
        (wadah.current && wadah.current.contains(e.target)) ||
        (menu.current && menu.current.contains(e.target));
      if (!didalam) setBuka(false);
    };
    const tutupEsc = (e) => {
      if (e.key === "Escape") setBuka(false);
    };
    aturPosisi();
    window.addEventListener("scroll", aturPosisi, true);
    window.addEventListener("resize", aturPosisi);
    document.addEventListener("click", tutupKlik);
    document.addEventListener("keydown", tutupEsc);
    return () => {
      window.removeEventListener("scroll", aturPosisi, true);
      window.removeEventListener("resize", aturPosisi);
      document.removeEventListener("click", tutupKlik);
      document.removeEventListener("keydown", tutupEsc);
    };
  }, [buka, lokasi.length]);

  const pilih = (id) => {
    onPilih(id);
    setBuka(false);
  };

  return (
    <div className="pemilih-lokasi" ref={wadah}>
      <span className="pemilih-label">Lokasi</span>
      <button
        type="button"
        ref={tombol}
        className="pemilih-trigger"
        aria-haspopup="listbox"
        aria-expanded={buka}
        onClick={() => setBuka(!buka)}
      >
        <span className="ikon-pemilih" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </span>
        <span className="nama">{aktif.nama_lokasi}</span>
        <svg className="panah" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {buka &&
        createPortal(
          <div
            className="pemilih-menu"
            ref={menu}
            role="listbox"
            aria-label="Daftar lokasi"
            style={{ top: posisi.top, left: posisi.left, width: posisi.lebar }}
          >
            {lokasi.map((l) => (
              <button
                key={l.id}
                type="button"
                role="option"
                aria-selected={l.id === aktif.id}
                className={`opsi${l.id === aktif.id ? " aktif" : ""}`}
                onClick={() => pilih(l.id)}
              >
                <span className="opsi-ikon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>
                <span className="opsi-teks">
                  <span className="opsi-nama">{l.nama_lokasi}</span>
                  <span className="opsi-koordinat">{l.latitude}, {l.longitude}</span>
                </span>
                {l.id === aktif.id && (
                  <svg className="opsi-centang" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
