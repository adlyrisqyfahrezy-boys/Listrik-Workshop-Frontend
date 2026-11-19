import { useState } from "react";
import IkonMata from "./IkonMata.jsx";
import * as api from "../lib/api.js";

const KOSONG = {
  nama: "",
  email: "",
  password: "",
  konfirmasi: "",
  setuju: false,
};

export default function HalamanDaftar({ onDaftar, onKeMasuk }) {
  const [form, setForm] = useState(KOSONG);
  const [tampilPassword, setTampilPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ubah = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    if (error) setError("");
  };

  const kirim = async (e) => {
    e.preventDefault();
    const nama = form.nama.trim();
    const email = form.email.trim();

    if (!nama || !email || !form.password || !form.konfirmasi) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    if (nama.length < 2) {
      setError("Nama lengkap terlalu pendek.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email tidak valid.");
      return;
    }
    if (form.password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (form.password !== form.konfirmasi) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (!form.setuju) {
      setError("Setujui syarat dan ketentuan untuk melanjutkan.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.register({
        name: nama,
        nama,
        email,
        password: form.password,
        password_confirmation: form.konfirmasi,
      });

      if (res.token) {
        onDaftar(email, res.pengguna);
      } else {
        alert("Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.");
        onKeMasuk();
      }
    } catch (err) {
      setError(err.message || "Gagal mendaftar akun baru.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-halaman">
      <section className="login-kartu">
        <div className="login-sambutan">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 2 5 13h5.5L9 22l9-12h-5.5L13.5 2Z" />
            </svg>
          </span>
          <div>
            <p className="login-eyebrow">Listrik Workshop</p>
            <h1>Buat akun baru</h1>
            <p className="kecil">
              Daftar untuk mengelola inventaris beban listrik workshop.
            </p>
          </div>
        </div>

        <form className="login-form" onSubmit={kirim}>
          <div className="login-grup">
            <label htmlFor="daftar-nama">Nama lengkap</label>
            <input
              id="daftar-nama"
              name="nama"
              type="text"
              autoComplete="name"
              placeholder="Nama Anda"
              value={form.nama}
              onChange={ubah}
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          <div className="login-grup">
            <label htmlFor="daftar-email">Email</label>
            <input
              id="daftar-email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="nama@workshop.id"
              value={form.email}
              onChange={ubah}
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          <div className="login-grup">
            <label htmlFor="daftar-password">Kata sandi</label>
            <div className="login-input-sandi">
              <input
                id="daftar-password"
                name="password"
                type={tampilPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={ubah}
                aria-invalid={Boolean(error)}
                required
              />
              <button
                type="button"
                className="link login-mata"
                aria-label={
                  tampilPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
                aria-pressed={tampilPassword}
                onClick={() => setTampilPassword((nilai) => !nilai)}
              >
                <IkonMata terlihat={tampilPassword} />
              </button>
            </div>
          </div>

          <div className="login-grup">
            <label htmlFor="daftar-konfirmasi">Konfirmasi kata sandi</label>
            <input
              id="daftar-konfirmasi"
              name="konfirmasi"
              type={tampilPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Ulangi kata sandi"
              value={form.konfirmasi}
              onChange={ubah}
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          <label className="login-setuju">
            <input
              name="setuju"
              type="checkbox"
              checked={form.setuju}
              onChange={ubah}
            />
            <span>Saya setuju dengan syarat dan ketentuan.</span>
          </label>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit">Daftar</button>
        </form>

        <p className="login-catatan">
          Sudah punya akun?{" "}
          <button type="button" className="link" onClick={onKeMasuk}>
            Masuk
          </button>
        </p>
        <p className="login-mode">
          Mode tampilan: pendaftaran belum tersimpan ke backend.
        </p>
      </section>
    </main>
  );
}
