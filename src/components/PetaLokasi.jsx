// Menampilkan peta OpenStreetMap dari latitude & longitude (tb_lokasi).
// Pakai iframe embed bawaan OSM, jadi tidak perlu library tambahan.
export default function PetaLokasi({ lokasi }) {
  const { latitude: lat, longitude: lon, nama_lokasi } = lokasi;
  const delta = 0.005; // lebar area peta di sekitar titik
  const bbox = [lon - delta, lat - delta, lon + delta, lat + delta].join("%2C");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
  const linkBesar = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;

  return (
    <div className="kartu peta">
      <div className="kartu-judul">
        <div className="judul-grup">
          <span className="ikon-kartu hijau" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <h2>Peta lokasi</h2>
        </div>
        <a href={linkBesar} target="_blank" rel="noreferrer">
          Buka peta besar
        </a>
      </div>
      <iframe title={`Peta ${nama_lokasi}`} src={src} loading="lazy" />
      <p className="koordinat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        Koordinat: {lat}, {lon}
      </p>
    </div>
  );
}
