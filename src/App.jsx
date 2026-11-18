import { useMemo, useState } from "react";
import { useInventory } from "./hooks/useInventory.js";
import RingkasanBeban from "./components/RingkasanBeban.jsx";
import PetaLokasi from "./components/PetaLokasi.jsx";
import KartuRuang from "./components/KartuRuang.jsx";
import FormLokasi from "./components/FormLokasi.jsx";
import PemilihLokasi from "./components/PemilihLokasi.jsx";
import HalamanLogin from "./components/HalamanLogin.jsx";

export default function App() {
  const db = useInventory();
  const [idLokasiDipilih, setIdLokasiDipilih] = useState(null);
  const [tampilFormLokasi, setTampilFormLokasi] = useState(false);
  const [namaRuangBaru, setNamaRuangBaru] = useState("");
  const [sudahMasuk, setSudahMasuk] = useState(false);
  const [pengguna, setPengguna] = useState("");

  // Lokasi aktif: yang dipilih user, atau lokasi pertama kalau belum memilih.
  const lokasiAktif = db.lokasi.find((l) => l.id === idLokasiDipilih) ?? db.lokasi[0] ?? null;

  // Semua data turunan dihitung dari lokasi aktif.
  const { meteran, ruangLokasi, perangkatPerRuang, totalDaya } = useMemo(() => {
    if (!lokasiAktif) return { meteran: null, ruangLokasi: [], perangkatPerRuang: {}, totalDaya: 0 };
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

  const tambahRuang = async (e) => {
    e.preventDefault();
    const nama = namaRuangBaru.trim();
    if (!nama || !lokasiAktif) return;
    const hasil = await db.tambahRuang(nama, lokasiAktif.id);
    if (hasil != null) setNamaRuangBaru("");
  };

  const hapusLokasi = () => {
    if (!lokasiAktif) return;
    if (window.confirm(`Hapus lokasi "${lokasiAktif.nama_lokasi}" beserta semua ruang dan perangkatnya?`)) {
      db.hapusLokasi(lokasiAktif.id);
      setIdLokasiDipilih(null);
    }
  };

  if (!sudahMasuk) {
    return (
      <HalamanLogin
        onMasuk={(email) => {
          setPengguna(email);
          setSudahMasuk(true);
        }}
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
            <p className="kecil">Inventarisasi beban listrik per ruangan workshop</p>
          </div>
        </div>

        <div className="pilih-lokasi">
          {db.lokasi.length > 0 && (
            <PemilihLokasi
              lokasi={db.lokasi}
              aktif={lokasiAktif}
              onPilih={setIdLokasiDipilih}
            />
          )}
          <span className="header-pengguna">{pengguna}</span>
          <button onClick={() => setTampilFormLokasi(true)}>+ Lokasi</button>
          <button className="sekunder" onClick={() => setSudahMasuk(false)}>
            Keluar
          </button>
        </div>
      </header>

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

      {db.loading ? (
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
