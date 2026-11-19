const BASIS = import.meta.env.DEV
  ? "/api"
  : (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

const JALUR = {
  lokasi: "/lokasi",
  meteran: "/meteran",
  ruang: "/ruang",
  perangkat: "/perangkat",
};

export function ambilToken() {
  return localStorage.getItem("access_token") || localStorage.getItem("token") || null;
}

export function simpanToken(token) {
  if (token) {
    localStorage.setItem("access_token", token);
  }
}

export function hapusToken() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token");
  localStorage.removeItem("pengguna");
  localStorage.removeItem("peran");
}

export function ambilPeran() {
  return localStorage.getItem("peran") || "";
}

export function simpanPeran(peran) {
  if (peran) localStorage.setItem("peran", String(peran));
  else localStorage.removeItem("peran");
}

export function adalahAdmin(pengguna) {
  const peran = pengguna?.role ?? ambilPeran();
  if (Array.isArray(peran)) {
    return peran.some((item) => String(item).toLowerCase() === "admin");
  }
  return String(peran || "").toLowerCase() === "admin";
}

export function penggunaDari(isi) {
  return isi?.user ?? isi?.data?.user ?? isi?.data ?? isi ?? {};
}

export class SesiHabisError extends Error {
  constructor() {
    super("Sesi berakhir. Silakan masuk kembali.");
    this.name = "SesiHabisError";
  }
}

async function minta(path, options = {}) {
  const { headers, ...rest } = options;
  const token = ambilToken();
  const respons = await fetch(`${BASIS}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    if (
      (respons.status === 401 || respons.status === 403) &&
      !["/login", "/register", "/refresh"].includes(path)
    ) {
      hapusToken();
      throw new SesiHabisError();
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

export async function login(email, password) {
  const isi = await minta("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const token = isi?.access_token || isi?.token || isi?.data?.token || isi?.data?.access_token;
  if (!token) {
    throw new Error("Respon login tidak memuat access_token.");
  }

  simpanToken(token);
  const pengguna = penggunaDari(isi);
  simpanPeran(pengguna.role);
  return { token, data: isi, pengguna };
}

export async function register(data) {
  const isi = await minta("/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  const token = isi?.access_token || isi?.token || isi?.data?.token || isi?.data?.access_token;
  if (token) {
    simpanToken(token);
  }
  const pengguna = penggunaDari(isi);
  simpanPeran(pengguna.role);
  return { token, data: isi, pengguna };
}

export async function ambilProfil() {
  return minta("/me");
}

export function simpanProfil({ nama, email, password, password_confirmation }) {
  return minta("/profile", {
    method: "PUT",
    body: JSON.stringify({
      name: nama,
      email,
      ...(password ? { password, password_confirmation } : {}),
    }),
  });
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

export async function ubahPerangkat(id, { id_ruang, nama_perangkat, jumlah, uom, daya }) {
  return minta(`${JALUR.perangkat}/${id}`, {
    method: "PUT",
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

export async function ambilDaftarAkun() {
  const isi = await minta("/users");
  if (Array.isArray(isi)) return isi;
  if (Array.isArray(isi?.data)) return isi.data;
  if (Array.isArray(isi?.users)) return isi.users;
  if (Array.isArray(isi?.rows)) return isi.rows;
  return [];
}

export function ubahStatusAkun(id, aktif) {
  return minta(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: aktif }),
  });
}

export function tambahAkun(data) {
  return minta("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function ubahAkun(id, data) {
  return minta(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function hapusAkun(id) {
  return minta(`/users/${id}`, { method: "DELETE" });
}
