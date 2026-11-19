import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useInventory } from "./hooks/useInventory.js";
import RingkasanBeban from "./components/RingkasanBeban.jsx";
import PetaLokasi from "./components/PetaLokasi.jsx";
import KartuRuang from "./components/KartuRuang.jsx";
import FormLokasi from "./components/FormLokasi.jsx";
import PemilihLokasi from "./components/PemilihLokasi.jsx";
import HalamanLogin from "./components/HalamanLogin.jsx";
import HalamanDaftar from "./components/HalamanDaftar.jsx";
import HalamanProfil, { AvatarProfil } from "./components/HalamanProfil.jsx";
import HalamanAkun from "./components/HalamanAkun.jsx";
import * as api from "./lib/api.js";

export default function App() {
  const [idLokasiDipilih, setIdLokasiDipilih] = useState(null);
  const [tampilFormLokasi, setTampilFormLokasi] = useState(false);
  const [namaRuangBaru, setNamaRuangBaru] = useState("");
  const [sudahMasuk, setSudahMasuk] = useState(false);
  const [tampilDaftar, setTampilDaftar] = useState(false);
  const [pengguna, setPengguna] = useState("");
  const [pesanSesi, setPesanSesi] = useState("");
  const [menuBuka, setMenuBuka] = useState(false);
  const [tampilProfil, setTampilProfil] = useState(false);
  const [tampilAkun, setTampilAkun] = useState(false);
  const [peran, setPeran] = useState(() => api.ambilPeran());
  const admin = api.adalahAdmin({ role: peran });
  const [namaProfil, setNamaProfil] = useState(
    () => localStorage.getItem("nama_profil") || "",
  );
  const [fotoProfil, setFotoProfil] = useState(
    () => localStorage.getItem("foto_profil") || "",
  );
  const db = useInventory(sudahMasuk, () => {
    setPesanSesi("Sesi berakhir. Silakan masuk kembali.");
    setSudahMasuk(false);
    setMenuBuka(false);
    setTampilProfil(false);
    setTampilAkun(false);
  });

  // Lokasi aktif: yang dipilih user, atau lokasi pertama kalau belum memilih.
  const lokasiAktif =
    db.lokasi.find((l) => l.id === idLokasiDipilih) ?? db.lokasi[0] ?? null;

  // Semua data turunan dihitung dari lokasi aktif.
  const { meteran, ruangLokasi, perangkatPerRuang, totalDaya } = useMemo(() => {
    if (!lokasiAktif)
      return {
        meteran: null,
        ruangLokasi: [],
        perangkatPerRuang: {},
        totalDaya: 0,
      };
    const ruangLokasi = db.ruang.filter((r) => r.id_lokasi === lokasiAktif.id);
    const perangkatPerRuang = {};
    let totalDaya = 0;
    for (const r of ruangLokasi) {
      const daftar = db.perangkat.filter((p) => p.id_ruang === r.id);
      perangkatPerRuang[r.id] = daftar;
      totalDaya += daftar.reduce((jml, p) => jml + p.total_daya, 0);
    }
    return {
      meteran: db.meteran.find((m) => m.id_lokasi === lokasiAktif.id) ?? null,
      ruangLokasi,
      perangkatPerRuang,
      totalDaya,
    };
  }, [db.ruang, db.perangkat, db.meteran, lokasiAktif]);

  useEffect(() => {
    if (!menuBuka) return;
    const tutupEsc = (e) => {
      if (e.key === "Escape") setMenuBuka(false);
    };
    const overflowLama = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", tutupEsc);
    return () => {
      document.body.style.overflow = overflowLama;
      document.removeEventListener("keydown", tutupEsc);
    };
  }, [menuBuka]);

  const simpanProfilData = ({ nama, email, foto, peran: peranBaru }) => {
    if (nama) {
      setNamaProfil(nama);
      localStorage.setItem("nama_profil", nama);
    }
    if (email) setPengguna(email);
    if (foto !== undefined) {
      setFotoProfil(foto);
      if (foto) localStorage.setItem("foto_profil", foto);
      else localStorage.removeItem("foto_profil");
    }
    if (peranBaru !== undefined) {
      setPeran(peranBaru || "");
      api.simpanPeran(peranBaru);
    }
  };

  const keluar = () => {
    api.hapusToken();
    localStorage.removeItem("nama_profil");
    localStorage.removeItem("foto_profil");
    setNamaProfil("");
    setFotoProfil("");
    setPengguna("");
    setPesanSesi("");
    setTampilProfil(false);
    setTampilAkun(false);
    setPeran("");
    setMenuBuka(false);
    setSudahMasuk(false);
  };

  const tambahRuang = async (e) => {
    e.preventDefault();
    const nama = namaRuangBaru.trim();
    if (!nama || !lokasiAktif) return;
    const hasil = await db.tambahRuang(nama, lokasiAktif.id);
    if (hasil != null) setNamaRuangBaru("");
  };

  const hapusLokasi = () => {
    if (!lokasiAktif) return;
    if (
      window.confirm(
        `Hapus lokasi "${lokasiAktif.nama_lokasi}" beserta semua ruang dan perangkatnya?`,
      )
    ) {
      db.hapusLokasi(lokasiAktif.id);
      setIdLokasiDipilih(null);
    }
  };

  if (!sudahMasuk) {
    const masuk = (email, penggunaData) => {
      const peranBaru = penggunaData?.role ?? "";
      setPengguna(email);
      setPeran(peranBaru);
      api.simpanPeran(peranBaru);
      setPesanSesi("");
      setTampilDaftar(false);
      setTampilProfil(false);
      setTampilAkun(false);
      setMenuBuka(false);
      setSudahMasuk(true);
    };
    return tampilDaftar ? (
      <HalamanDaftar
        onDaftar={masuk}
        onKeMasuk={() => setTampilDaftar(false)}
      />
    ) : (
      <HalamanLogin
        onMasuk={masuk}
        onKeDaftar={() => setTampilDaftar(true)}
        pesanSesi={pesanSesi}
      />
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 2 5 13h5.5L9 22l9-12h-5.5L13.5 2Z" />
            </svg>
          </span>
          <div>
            <h1>Listrik Workshop</h1>
            <p className="kecil">
              Inventarisasi beban listrik per ruangan workshop
            </p>
          </div>
        </div>

        <div className={`header-kanan${menuBuka ? " dengan-menu" : ""}`}>
          <div className="pilih-lokasi">
            {db.lokasi.length > 0 && (
              <PemilihLokasi
                lokasi={db.lokasi}
                aktif={lokasiAktif}
                onPilih={setIdLokasiDipilih}
              />
            )}
            <button onClick={() => setTampilFormLokasi(true)}>+ Lokasi</button>
          </div>

          <div className={`header-menu${menuBuka ? " terbuka" : ""}`}>
            <button
              type="button"
              className="menu-hamburger"
              aria-label={menuBuka ? "Tutup menu akun" : "Buka menu akun"}
              aria-expanded={menuBuka}
              aria-haspopup="menu"
              onClick={() => setMenuBuka((buka) => !buka)}
            >
              <span className="hamburger-garis" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      {menuBuka &&
        createPortal(
          <div
            className="sidebar-latar"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setMenuBuka(false);
            }}
          >
            <aside className="menu-samping" role="menu" aria-label="Menu akun">
              <div className="menu-samping-header">
                <span className="menu-samping-judul">Menu akun</span>
                <button
                  type="button"
                  className="menu-tutup"
                  aria-label="Tutup menu"
                  onClick={() => setMenuBuka(false)}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="menu-pengguna">
                <AvatarProfil
                  nama={namaProfil || pengguna}
                  email={pengguna}
                  foto={fotoProfil}
                  className="profil-avatar sidebar-avatar"
                />
                <strong className="sidebar-nama">{namaProfil || pengguna}</strong>
                <span className="kecil sidebar-email">{pengguna}</span>
              </div>
              <nav className="menu-samping-isi">
                <button
                  type="button"
                  className="menu-item"
                  role="menuitem"
                  onClick={() => {
                    setTampilProfil(true);
                    setMenuBuka(false);
                  }}
                >
                  Profil akun
                </button>
                {admin && (
                  <button
                    type="button"
                    className="menu-item"
                    role="menuitem"
                    onClick={() => {
                      setTampilAkun(true);
                      setTampilProfil(false);
                      setMenuBuka(false);
                    }}
                  >
                    Kelola akun
                  </button>
                )}
                <button
                  type="button"
                  className="menu-item bahaya"
                  role="menuitem"
                  onClick={keluar}
                >
                  Keluar
                </button>
              </nav>
              <div className="menu-samping-kaki">
                Masuk sebagai {admin ? "admin" : "user"}
              </div>
            </aside>
          </div>,
          document.body,
        )}

      {tampilFormLokasi && (
        <div className="kartu">
          <div className="kartu-judul">
            <h2>Lokasi baru</h2>
          </div>
          <FormLokasi
            onBatal={() => setTampilFormLokasi(false)}
            onTambah={async (data) => {
              const id = await db.tambahLokasi(data);
              if (id != null) setIdLokasiDipilih(id);
              setTampilFormLokasi(false);
            }}
          />
        </div>
      )}

      {db.aksiError && (
        <div className="kartu kosong">
          <p>Gagal menyimpan perubahan: {db.aksiError}</p>
        </div>
      )}

      {tampilAkun && admin ? (
        <HalamanAkun
          emailSaatIni={pengguna}
          onKembali={() => setTampilAkun(false)}
        />
      ) : tampilProfil ? (
        <HalamanProfil
          nama={namaProfil || pengguna}
          email={pengguna}
          foto={fotoProfil}
          onSimpan={simpanProfilData}
          onKembali={() => setTampilProfil(false)}
        />
      ) : db.loading ? (
        <div className="kartu kosong">
          <p>Memuat data dari backend…</p>
        </div>
      ) : db.error ? (
        <div className="kartu kosong">
          <p>Gagal memuat data: {db.error}</p>
          <button onClick={() => db.muatUlang(true)}>Coba lagi</button>
        </div>
      ) : !lokasiAktif ? (
        <div className="kartu kosong">
          <p>Belum ada lokasi. Klik "+ Lokasi" untuk mulai mencatat.</p>
        </div>
      ) : (
        <main className="grid">
          <div className="kolom-samping">
            <RingkasanBeban
              meteran={meteran}
              totalDaya={totalDaya}
              onUbahMaks={(nilai) => db.ubahMaksWatt(meteran.id, nilai)}
            />
            <PetaLokasi lokasi={lokasiAktif} />
            <button className="link bahaya-teks" onClick={hapusLokasi}>
              Hapus lokasi ini
            </button>
          </div>

          <div className="kolom-utama">
            <form className="form-baris tambah-ruang" onSubmit={tambahRuang}>
              <input
                placeholder="Nama ruang baru, mis. Ruang Cat"
                value={namaRuangBaru}
                onChange={(e) => setNamaRuangBaru(e.target.value)}
                aria-label="Nama ruang baru"
              />
              <button type="submit">Tambah ruang</button>
            </form>

            {ruangLokasi.length === 0 ? (
              <div className="kartu kosong">
                <p>Belum ada ruang di lokasi ini.</p>
              </div>
            ) : (
              ruangLokasi.map((r) => (
                <KartuRuang
                  key={r.id}
                  ruang={r}
                  perangkat={perangkatPerRuang[r.id]}
                  totalSemua={totalDaya}
                  onTambahPerangkat={db.tambahPerangkat}
                  onUbahPerangkat={db.ubahPerangkat}
                  onHapusPerangkat={db.hapusPerangkat}
                  onHapusRuang={db.hapusRuang}
                />
              ))
            )}
          </div>
        </main>
      )}
    </div>
  );
}
