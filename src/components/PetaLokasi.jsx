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
        <h2>Peta lokasi</h2>
        <a href={linkBesar} target="_blank" rel="noreferrer">
          Buka peta besar
        </a>
      </div>
      <iframe title={`Peta ${nama_lokasi}`} src={src} loading="lazy" />
      <p className="kecil">
        Koordinat: {lat}, {lon}
      </p>
    </div>
  );
}
