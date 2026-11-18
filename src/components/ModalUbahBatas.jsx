import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ModalUbahBatas({ nilaiAwal, onSimpan, onBatal }) {
  const [nilai, setNilai] = useState(String(nilaiAwal));
  const input = useRef(null);

  useEffect(() => {
    input.current?.focus();
    input.current?.select();
    const tutupEsc = (e) => {
      if (e.key === "Escape") onBatal();
    };
    document.addEventListener("keydown", tutupEsc);
    return () => document.removeEventListener("keydown", tutupEsc);
  }, [onBatal]);

  const kirim = (e) => {
    e.preventDefault();
    const angka = Number(nilai);
    if (Number.isFinite(angka) && angka > 0) onSimpan(angka);
  };

  return createPortal(
    <div className="modal-latar" onMouseDown={(e) => e.target === e.currentTarget && onBatal()}>
      <div className="modal-kartu" role="dialog" aria-modal="true" aria-label="Ubah batas meteran">
        <div className="modal-judul">
          <span className="ikon-kartu" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 18a8 8 0 1 1 16 0" />
              <path d="m12 14 4-4" />
              <circle cx="12" cy="18" r="1.2" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <h2>Ubah batas meteran</h2>
        </div>
        <form onSubmit={kirim}>
          <label>
            Batas daya (W)
            <input
              ref={input}
              type="number"
              min="1"
              step="any"
              value={nilai}
              onChange={(e) => setNilai(e.target.value)}
              required
            />
          </label>
          <div className="aksi-form">
            <button type="submit">Simpan</button>
            <button type="button" className="sekunder" onClick={onBatal}>
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
