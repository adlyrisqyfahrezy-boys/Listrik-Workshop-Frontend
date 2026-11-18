import FormPerangkat from "./FormPerangkat.jsx";
import { formatWatt, formatPersen } from "../lib/format.js";

// Satu ruangan: tabel perangkat + total daya ruangan + form tambah perangkat.
export default function KartuRuang({ ruang, perangkat, totalSemua, onTambahPerangkat, onHapusPerangkat, onHapusRuang }) {
  const totalRuang = perangkat.reduce((jml, p) => jml + p.total_daya, 0);
  const porsi = totalSemua > 0 ? (totalRuang / totalSemua) * 100 : 0;

  const hapusRuang = () => {
    if (window.confirm(`Hapus ruang "${ruang.nama_ruang}" beserta semua perangkatnya?`)) {
      onHapusRuang(ruang.id);
    }
  };

  return (
    <section className="kartu">
      <div className="kartu-judul">
        <h3>{ruang.nama_ruang}</h3>
        <button className="link bahaya-teks" onClick={hapusRuang}>
          Hapus ruang
        </button>
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
                    <button
                      className="link bahaya-teks"
                      onClick={() => onHapusPerangkat(p.id)}
                      aria-label={`Hapus ${p.nama_perangkat}`}
                    >
                      Hapus
                    </button>
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
    </section>
  );
}
