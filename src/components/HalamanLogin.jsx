import { useState } from "react";
import IkonMata from "./IkonMata.jsx";

const KOSONG = { email: "", password: "" };

export default function HalamanLogin({ onMasuk }) {
  const [form, setForm] = useState(KOSONG);
  const [tampilPassword, setTampilPassword] = useState(false);
  const [error, setError] = useState("");

  const ubah = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const kirim = (e) => {
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
    onMasuk(email);
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

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit">Masuk</button>
        </form>

        <p className="login-catatan">
          Mode tampilan: email dan kata sandi apa pun akan membuka aplikasi.
        </p>
      </section>
    </main>
  );
}
