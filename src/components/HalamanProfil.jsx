import { useEffect, useState } from "react";
import IkonMata from "./IkonMata.jsx";
import * as api from "../lib/api.js";

function penggunaDari(isi) {
  return isi?.user ?? isi?.data?.user ?? isi?.data ?? isi ?? {};
}

function fotoDari(p) {
  return p?.foto ?? p?.photo ?? p?.avatar ?? p?.foto_profil ?? p?.image ?? "";
}

export function AvatarProfil({ nama = "", email = "", foto = "", className = "" }) {
  const inisial = (nama || email || "?").trim().charAt(0).toUpperCase();
  return (
    <span className={className || "profil-avatar"} aria-hidden="true">
      {foto ? <img src={foto} alt="" /> : inisial}
    </span>
  );
}

export default function HalamanProfil({
  nama = "",
  email = "",
  foto = "",
  onSimpan,
  onKembali,
}) {
  const [form, setForm] = useState({ nama, email, password: "", konfirmasi: "" });
  const [fotoSaatIni, setFotoSaatIni] = useState(foto);
  const [tampilPassword, setTampilPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pesan, setPesan] = useState("");

  useEffect(() => {
    setFotoSaatIni(foto);
  }, [foto]);

  useEffect(() => {
    let aktif = true;
    api
      .ambilProfil()
      .then((isi) => {
        if (!aktif) return;
        const p = penggunaDari(isi);
        const namaBaru = p.name ?? p.nama ?? "";
        const emailBaru = p.email ?? "";
        const fotoBaru = fotoDari(p);
        if (fotoBaru && typeof fotoBaru === "string") setFotoSaatIni(fotoBaru);
        if (namaBaru || emailBaru || fotoBaru || p.role) {
          setForm((f) => ({ ...f, nama: namaBaru || f.nama, email: emailBaru || f.email }));
          onSimpan({
            nama: namaBaru || nama,
            email: emailBaru || email,
            foto: fotoBaru || fotoSaatIni,
            peran: p.role,
          });
        }
      })
      .catch(() => {});
    return () => {
      aktif = false;
    };
  }, []);

  const ubah = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setPesan("");
  };

  const unggahFoto = (e) => {
    const berkas = e.target.files?.[0];
    e.target.value = "";
    if (!berkas) return;
    if (!berkas.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    const pembaca = new FileReader();
    pembaca.onload = () => {
      const gambar = new Image();
      gambar.onload = () => {
        const ukuran = 256;
        const sisi = Math.min(gambar.width, gambar.height);
        const kanvas = document.createElement("canvas");
        kanvas.width = ukuran;
        kanvas.height = ukuran;
        kanvas
          .getContext("2d")
          .drawImage(
            gambar,
            (gambar.width - sisi) / 2,
            (gambar.height - sisi) / 2,
            sisi,
            sisi,
            0,
            0,
            ukuran,
            ukuran,
          );
        const data = kanvas.toDataURL("image/jpeg", 0.82);
        setFotoSaatIni(data);
        setError("");
        setPesan("Foto profil berhasil diganti.");
        onSimpan({ nama: form.nama, email: form.email, foto: data });
      };
      gambar.src = pembaca.result;
    };
    pembaca.readAsDataURL(berkas);
  };

  const kirim = async (e) => {
    e.preventDefault();
    const namaBaru = form.nama.trim();
    const emailBaru = form.email.trim();

    if (namaBaru.length < 2) {
      setError("Nama lengkap terlalu pendek.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailBaru)) {
      setError("Format email tidak valid.");
      return;
    }
    if (form.password || form.konfirmasi) {
      if (form.password.length < 8) {
        setError("Kata sandi baru minimal 8 karakter.");
        return;
      }
      if (form.password !== form.konfirmasi) {
        setError("Konfirmasi kata sandi tidak cocok.");
        return;
      }
    }
    if (namaBaru === nama && emailBaru === email && !form.password) {
      setError("Belum ada perubahan yang disimpan.");
      return;
    }

    setLoading(true);
    setError("");
    setPesan("");
    try {
      const hasil = await api.simpanProfil({
        nama: namaBaru,
        email: emailBaru,
        password: form.password,
        password_confirmation: form.konfirmasi,
      });
      const fotoHasil = fotoDari(penggunaDari(hasil));
      const p = penggunaDari(hasil);
      const namaTersimpan = p.name ?? p.nama ?? namaBaru;
      const emailTersimpan = p.email ?? emailBaru;
      setForm({ nama: namaTersimpan, email: emailTersimpan, password: "", konfirmasi: "" });
      if (fotoHasil && typeof fotoHasil === "string") setFotoSaatIni(fotoHasil);
      setPesan("Profil berhasil disimpan.");
      onSimpan({
        nama: namaTersimpan,
        email: emailTersimpan,
        foto: fotoHasil || fotoSaatIni,
        peran: p.role,
      });
    } catch (err) {
      setError(err.message || "Gagal menyimpan profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="kartu kartu-profil">
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
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20a7 7 0 0 1 14 0" />
            </svg>
          </span>
          <div>
            <h2>Profil akun</h2>
            <p className="kecil">Ubah nama, email, atau kata sandi akun Anda.</p>
          </div>
        </div>
        <button type="button" className="sekunder" onClick={onKembali}>
          Kembali
        </button>
      </div>

      <div className="profil-identitas">
        <AvatarProfil nama={nama || form.nama} email={email} foto={fotoSaatIni} />
        <div>
          <strong>{nama || "Nama belum diisi"}</strong>
          <p className="kecil">{email}</p>
          <label className="profil-unggah">
            Ganti foto
            <input type="file" accept="image/*" onChange={unggahFoto} />
          </label>
        </div>
      </div>

      <div className="profil-baris">
        <span>Kata sandi</span>
        <strong aria-label="Kata sandi tersembunyi">••••••••</strong>
        <p className="kecil">Tersimpan aman, tidak dapat ditampilkan.</p>
      </div>

      <form className="form-kolom" onSubmit={kirim}>
        <div className="dua-kolom">
          <label>
            Nama lengkap
            <input
              name="nama"
              type="text"
              autoComplete="name"
              value={form.nama}
              onChange={ubah}
              placeholder="Nama Anda"
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={ubah}
              placeholder="nama@workshop.id"
            />
          </label>
        </div>

        <div className="dua-kolom">
          <label>
            Kata sandi baru
            <span className="login-input-sandi">
              <input
                name="password"
                type={tampilPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.password}
                onChange={ubah}
                placeholder="Kosongkan jika tidak diubah"
              />
              <button
                type="button"
                className="link login-mata"
                aria-label={tampilPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                aria-pressed={tampilPassword}
                onClick={() => setTampilPassword((nilai) => !nilai)}
              >
                <IkonMata terlihat={tampilPassword} />
              </button>
            </span>
          </label>
          <label>
            Konfirmasi kata sandi
            <input
              name="konfirmasi"
              type={tampilPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.konfirmasi}
              onChange={ubah}
              placeholder="Ulangi kata sandi baru"
            />
          </label>
        </div>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
        {pesan && (
          <p className="profil-pesan" role="status">
            {pesan}
          </p>
        )}

        <div className="aksi-form">
          <button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan perubahan"}
          </button>
          <button type="button" className="sekunder" onClick={onKembali}>
            Batal
          </button>
        </div>
      </form>
    </section>
  );
}
