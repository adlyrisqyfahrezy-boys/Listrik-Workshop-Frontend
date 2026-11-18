const BASIS = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

const JALUR = {
  lokasi: "/lokasi",
  meteran: "/meteran",
  ruang: "/ruang",
  perangkat: "/perangkat",
};

async function minta(path, options = {}) {
  const { headers, ...rest } = options;
  const respons = await fetch(`${BASIS}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  });

  if (!respons.ok) {
    let pesan = `HTTP ${respons.status}`;
    try {
      const isi = await respons.json();
      pesan = isi?.pesan || isi?.message || isi?.error || pesan;
    } catch {
      pesan = `HTTP ${respons.status}`;
    }
    throw new Error(pesan);
  }

  if (respons.status === 204) return null;
  const teks = await respons.text();
  if (!teks.trim()) return null;
  try {
    return JSON.parse(teks);
  } catch {
    return null;
  }
}

function sebagaiDaftar(isi) {
  if (Array.isArray(isi)) return isi;
  if (Array.isArray(isi?.data)) return isi.data;
  if (Array.isArray(isi?.rows)) return isi.rows;
  return [];
}

function idDari(isi) {
  return isi?.id ?? isi?.data?.id ?? null;
}

export async function ambilInventaris() {
  const [lokasi, meteran, ruang, perangkat] = await Promise.all([
    minta(JALUR.lokasi),
    minta(JALUR.meteran),
    minta(JALUR.ruang),
    minta(JALUR.perangkat),
  ]);

  return {
    lokasi: sebagaiDaftar(lokasi),
    meteran: sebagaiDaftar(meteran),
    ruang: sebagaiDaftar(ruang),
    perangkat: sebagaiDaftar(perangkat),
  };
}

export async function tambahLokasi(data) {
  const isi = await minta(JALUR.lokasi, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return idDari(isi);
}

export function ubahMaksWatt(id, maks_watt) {
  return minta(`${JALUR.meteran}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ maks_watt }),
  });
}

export function hapusLokasi(id) {
  return minta(`${JALUR.lokasi}/${id}`, { method: "DELETE" });
}

export function tambahRuang(data) {
  return minta(JALUR.ruang, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function hapusRuang(id) {
  return minta(`${JALUR.ruang}/${id}`, { method: "DELETE" });
}

export async function tambahPerangkat({ id_ruang, nama_perangkat, jumlah, uom, daya }) {
  return minta(JALUR.perangkat, {
    method: "POST",
    body: JSON.stringify({
      id_ruang,
      nama_perangkat,
      jumlah,
      uom,
      daya,
      total_daya: jumlah * daya,
    }),
  });
}

export function hapusPerangkat(id) {
  return minta(`${JALUR.perangkat}/${id}`, { method: "DELETE" });
}
