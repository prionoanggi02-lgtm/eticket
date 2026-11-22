import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md space-y-3 text-center">
      <p className="text-5xl">🧭</p>
      <h1 className="text-xl font-bold">Halaman tidak ditemukan</h1>
      <p className="text-sm text-slate-500">Data yang Anda cari tidak ada atau Anda tidak memiliki akses.</p>
      <Link href="/" className="btn">Kembali ke Beranda</Link>
    </div>
  );
}
