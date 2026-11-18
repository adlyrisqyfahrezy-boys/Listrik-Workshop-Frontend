// Format angka daya sesuai penulisan Indonesia: 1500 -> "1.500 W".
const angka = new Intl.NumberFormat("id-ID");

export function formatWatt(watt) {
  return `${angka.format(watt)} W`;
}

export function formatPersen(nilai) {
  return `${angka.format(Math.round(nilai))}%`;
}

// Status beban terhadap batas meteran.
export function statusBeban(persen) {
  if (persen >= 100) return { kelas: "bahaya", teks: "Melebihi batas meteran" };
  if (persen >= 80) return { kelas: "waspada", teks: "Mendekati batas" };
  return { kelas: "aman", teks: "Aman" };
}
