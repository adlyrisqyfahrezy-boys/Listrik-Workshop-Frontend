import { useState } from "react";
import IkonMata from "./IkonMata.jsx";
import * as api from "../lib/api.js";

const KOSONG = { email: "", password: "" };

export default function HalamanLogin({ onMasuk, onKeDaftar, pesanSesi = "" }) {
  const [form, setForm] = useState(KOSONG);
  const [tampilPassword, setTampilPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ubah = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const kirim = async (e) => {
    e.preventDefault();
    const email = form.email.trim();
    if (!email || !form.password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email tidak valid.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const hasil = await api.login(email, form.password);
      onMasuk(email, hasil.pengguna);
    } catch (err) {
      setError(err.message || "Gagal masuk. Periksa kembali email dan kata sandi.");
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
            <h1>Selamat datang kembali</h1>
            <p className="kecil">Masuk untuk mengelola inventaris beban listrik workshop.</p>
          </div>
        </div>

        <form className="login-form" onSubmit={kirim}>
          <div className="login-grup">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
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
            <label htmlFor="login-password">Kata sandi</label>
            <div className="login-input-sandi">
              <input
                id="login-password"
                name="password"
                type={tampilPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={ubah}
                aria-invalid={Boolean(error)}
                required
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
            </div>
          </div>

          {(error || pesanSesi) && (
            <p className="login-error" role="alert">
              {error || pesanSesi}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="login-catatan">
          Belum punya akun? <button type="button" className="link" onClick={onKeDaftar}>Daftar</button>
        </p>
      </section>
    </main>
  );
}
