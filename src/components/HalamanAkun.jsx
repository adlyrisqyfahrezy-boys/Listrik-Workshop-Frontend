import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as api from "../lib/api.js";
import { AvatarProfil } from "./HalamanProfil.jsx";

function aktifDari(akun) {
  const nilai = akun?.is_active ?? akun?.active ?? akun?.aktif ?? akun?.status;
  if (typeof nilai === "boolean") return nilai;
  if (typeof nilai === "number") return nilai === 1;
  if (typeof nilai === "string") {
    return ["aktif", "active", "true", "1", "enabled"].includes(nilai.toLowerCase());
  }
  return true;
}

function idDari(akun) {
  return akun?.id ?? akun?.user_id ?? null;
}

function peranDari(akun) {
  return String(akun?.role ?? "user").toLowerCase() === "admin" ? "admin" : "user";
}

function FormAkun({ akun, onSimpan, onBatal }) {
  const [form, setForm] = useState(() => ({
    nama: akun ? akun.name ?? akun.nama ?? "" : "",
    email: akun?.email ?? "",
    password: "",
    konfirmasi: "",
    role: akun ? peranDari(akun) : "user",
    aktif: akun ? aktifDari(akun) : true,
  }));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const overflowLama = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowLama;
    };
  }, []);

  const ubah = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const kirim = async (e) => {
    e.preventDefault();
    const nama = form.nama.trim();
    const email = form.email.trim();

    if (nama.length < 2) {
      setError("Nama lengkap terlalu pendek.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email tidak valid.");
      return;
    }
    if (!akun && !form.password) {
      setError("Kata sandi wajib diisi untuk akun baru.");
      return;
    }
    if (form.password || form.konfirmasi) {
      if (form.password.length < 8) {
        setError("Kata sandi minimal 8 karakter.");
        return;
      }
      if (form.password !== form.konfirmasi) {
        setError("Konfirmasi kata sandi tidak cocok.");
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      await onSimpan({
        name: nama,
        nama,
        email,
        role: form.role,
        is_active: form.aktif,
        ...(form.password
          ? { password: form.password, password_confirmation: form.konfirmasi }
          : {}),
      });
    } catch (err) {
      setError(err.message || "Gagal menyimpan akun.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="modal-latar"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onBatal();
      }}
    >
      <div
        className={`modal-kartu modal-akun${akun ? " modal-akun-edit" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={akun ? "Ubah akun" : "Tambah akun"}
      >
        {akun && (
          <aside className="modal-akun-samping">
            <span className="modal-akun-label">Sedang diubah</span>
            <AvatarProfil
              nama={form.nama}
              email={form.email}
              foto={akun.foto ?? akun.avatar ?? ""}
              className="profil-avatar modal-akun-avatar"
            />
            <strong>{form.nama || "Tanpa nama"}</strong>
            <span className="kecil">{form.email}</span>
            <div className="modal-akun-badges">
              <span className={form.role === "admin" ? "admin" : ""}>
                {form.role === "admin" ? "Admin" : "User"}
              </span>
              <span className={form.aktif ? "" : "nonaktif"}>
                {form.aktif ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <p className="modal-akun-catatan">
              ID akun #{idDari(akun)} · perubahan disimpan setelah menekan tombol Simpan.
            </p>
          </aside>
        )}

        <div className="modal-akun-utama">
          <div className="modal-akun-header">
            <span className="ikon-kartu" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-4A3.5 3.5 0 0 0 4 18.5V20" />
                <circle cx="10" cy="8" r="3.5" />
                {akun ? (
                  <path d="m16 4 4 4-6 6-3 .8.8-3L16 4Z" />
                ) : (
                  <path d="M19 8v6M16 11h6" />
                )}
              </svg>
            </span>
            <div>
              <h2>{akun ? "Ubah akun" : "Tambah akun"}</h2>
              <p className="kecil">
                {akun
                  ? "Perbarui data dan akses pengguna."
                  : "Buat akun baru untuk pengguna workshop."}
              </p>
            </div>
            <button
              type="button"
              className="modal-tutup"
              aria-label="Tutup"
              onClick={onBatal}
            >
              ×
            </button>
          </div>

          <form onSubmit={kirim} className="form-kolom">
            <div className="form-bagian">
              <p className="form-bagian-judul">
                <span>01</span> Informasi akun
              </p>
              <div className="dua-kolom">
                <label>
                  Nama lengkap
                  <input
                    name="nama"
                    type="text"
                    autoComplete="name"
                    value={form.nama}
                    onChange={ubah}
                    placeholder="Nama pengguna"
                  />
                </label>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    autoComplete="off"
                    value={form.email}
                    onChange={ubah}
                    placeholder="nama@workshop.id"
                  />
                </label>
              </div>
            </div>

            <div className="form-bagian">
              <p className="form-bagian-judul">
                <span>02</span> Akses
              </p>
              <div className="dua-kolom">
                <label>
                  Role
                  <select name="role" value={form.role} onChange={ubah}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label className="akun-checkbox">
                  <span>
                    <strong>Akun aktif</strong>
                    <span className="kecil">
                      {form.aktif ? "Pengguna dapat masuk" : "Pengguna tidak dapat masuk"}
                    </span>
                  </span>
                  <input
                    name="aktif"
                    type="checkbox"
                    checked={form.aktif}
                    onChange={ubah}
                  />
                </label>
              </div>
            </div>

            <div className="form-bagian">
              <p className="form-bagian-judul">
                <span>03</span> Kata sandi
              </p>
              <p className="kecil">
                {akun
                  ? "Kosongkan jika tidak ingin mengubah kata sandi."
                  : "Gunakan minimal 8 karakter."}
              </p>
              <div className="dua-kolom">
                <label>
                  Kata sandi
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={ubah}
                    placeholder={akun ? "Tidak diubah" : "Minimal 8 karakter"}
                  />
                </label>
                <label>
                  Konfirmasi
                  <input
                    name="konfirmasi"
                    type="password"
                    autoComplete="new-password"
                    value={form.konfirmasi}
                    onChange={ubah}
                    placeholder="Ulangi kata sandi"
                  />
                </label>
              </div>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}
            <div className="modal-aksi">
              <button type="button" className="sekunder" onClick={onBatal}>
                Batal
              </button>
              <button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function HalamanAkun({ emailSaatIni = "", onKembali }) {
  const [daftar, setDaftar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pesan, setPesan] = useState("");
  const [prosesId, setProsesId] = useState(null);
  const [formAkun, setFormAkun] = useState(null);
  const sudahMuatRef = useRef(false);

  const muat = async () => {
    setLoading(true);
    setError("");
    try {
      setDaftar(await api.ambilDaftarAkun());
    } catch (e) {
      setError(e.message || "Gagal memuat daftar akun.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sudahMuatRef.current) return;
    sudahMuatRef.current = true;
    muat();
  }, []);

  useEffect(() => {
    if (!formAkun) return;
    const tutup = (e) => {
      if (e.key === "Escape") setFormAkun(null);
    };
    document.addEventListener("keydown", tutup);
    return () => document.removeEventListener("keydown", tutup);
  }, [formAkun]);

  const simpanAkun = async (data) => {
    setError("");
    setPesan("");
    const id = formAkun ? idDari(formAkun) : null;
    if (id != null) {
      await api.ubahAkun(id, data);
      setPesan("Akun berhasil diperbarui.");
    } else {
      await api.tambahAkun(data);
      setPesan("Akun berhasil ditambahkan.");
    }
    setFormAkun(null);
    await muat();
  };

  const ubahStatus = async (akun) => {
    const id = idDari(akun);
    const aktif = aktifDari(akun);
    if (id == null || prosesId !== null) return;

    setProsesId(id);
    setError("");
    setPesan("");
    try {
      const hasil = await api.ubahStatusAkun(id, !aktif);
      const perubahan = api.penggunaDari(hasil);
      setDaftar((semua) =>
        semua.map((item) =>
          idDari(item) === id
            ? {
                ...item,
                is_active:
                  perubahan?.is_active ?? perubahan?.active ?? perubahan?.aktif ?? !aktif,
              }
            : item,
        ),
      );
      setPesan(
        `${akun.email || "Akun"} berhasil ${aktif ? "dinonaktifkan" : "diaktifkan"}.`,
      );
    } catch (e) {
      setError(e.message || "Gagal mengubah status akun.");
    } finally {
      setProsesId(null);
    }
  };

  const hapusAkun = async (akun) => {
    const id = idDari(akun);
    if (id == null || prosesId !== null) return;
    if (
      !window.confirm(`Hapus akun "${akun.email || "ini"}"? Tindakan ini tidak dapat dibatalkan.`)
    ) {
      return;
    }

    setProsesId(id);
    setError("");
    setPesan("");
    try {
      await api.hapusAkun(id);
      setPesan("Akun berhasil dihapus.");
      await muat();
    } catch (e) {
      setError(e.message || "Gagal menghapus akun.");
    } finally {
      setProsesId(null);
    }
  };

  return (
    <section className="kartu kartu-akun">
      <div className="kartu-judul">
        <div className="judul-grup">
          <span className="ikon-kartu" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3 5 6v5c0 4.6 2.9 8.4 7 10 4.1-1.6 7-5.4 7-10V6l-7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <div>
            <h2>Kelola akun</h2>
            <p className="kecil">Tambah, ubah, aktif/nonaktifkan, atau hapus akun pengguna.</p>
          </div>
        </div>
        <div className="aksi-form">
          <button type="button" onClick={() => setFormAkun({})}>
            + Tambah akun
          </button>
          <button type="button" className="sekunder" onClick={onKembali}>
            Kembali
          </button>
        </div>
      </div>

      {error && (
        <p className="login-error" role="alert">
          {error} <button type="button" className="link" onClick={muat}>Coba lagi</button>
        </p>
      )}
      {pesan && (
        <p className="profil-pesan" role="status">
          {pesan}
        </p>
      )}

      {loading ? (
        <p className="kecil">Memuat daftar akun…</p>
      ) : daftar.length === 0 ? (
        <p className="kecil">Belum ada akun.</p>
      ) : (
        <div className="daftar-akun">
          {daftar.map((akun) => {
            const id = idDari(akun);
            const aktif = aktifDari(akun);
            const email = akun.email ?? "";
            const nama = akun.name ?? akun.nama ?? email;
            const diri = Boolean(
              email && emailSaatIni && email.toLowerCase() === emailSaatIni.toLowerCase(),
            );
            return (
              <div className="baris-akun" key={id ?? email}>
                <div className="akun-identitas">
                  <AvatarProfil
                    nama={nama}
                    email={email}
                    foto={akun.foto ?? akun.avatar ?? ""}
                  />
                  <div>
                    <strong>
                      {nama || "Tanpa nama"}
                      {diri ? " (Anda)" : ""}
                    </strong>
                    <span className="kecil">{email}</span>
                  </div>
                </div>
                <span
                  className={`peran-akun ${peranDari(akun) === "admin" ? "admin" : ""}`}
                >
                  {peranDari(akun) === "admin" ? "Admin" : "User"}
                </span>
                <button
                  type="button"
                  className={`sakelar ${aktif ? "aktif" : ""}`}
                  role="switch"
                  aria-checked={aktif}
                  aria-label={aktif ? "Nonaktifkan akun" : "Aktifkan akun"}
                  disabled={prosesId !== null || diri}
                  title={diri ? "Akun sendiri tidak dapat diubah" : undefined}
                  onClick={() => ubahStatus(akun)}
                >
                  <span className="sakelar-track" aria-hidden="true" />
                  <span>{prosesId === id ? "…" : aktif ? "Aktif" : "Nonaktif"}</span>
                </button>
                <div className="akun-aksi">
                  <button
                    type="button"
                    className="link"
                    disabled={diri}
                    title={diri ? "Gunakan halaman profil untuk akun sendiri" : undefined}
                    onClick={() => setFormAkun(akun)}
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    className="link bahaya-teks"
                    disabled={prosesId !== null || diri}
                    title={diri ? "Akun sendiri tidak dapat dihapus" : undefined}
                    onClick={() => hapusAkun(akun)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formAkun && (
        <FormAkun
          akun={idDari(formAkun) != null ? formAkun : null}
          onSimpan={simpanAkun}
          onBatal={() => setFormAkun(null)}
        />
      )}
    </section>
  );
}
