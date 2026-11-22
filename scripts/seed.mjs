// Generate data dummy (JSON) ke folder /data.
// Jalankan: npm run seed   (akan MENIMPA data yang ada)
import { writeFileSync, mkdirSync } from "fs";
import { randomBytes, scryptSync } from "crypto";
import path from "path";

const dir = path.join(process.cwd(), "data");
mkdirSync(dir, { recursive: true });

const hash = (pw) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
};

const now = new Date();
const iso = (d) => d.toISOString();

/** Tanggal/jam WIB (UTC+7) relatif dari hari ini. */
function wib(dayOffset, hour, minute) {
  const j = new Date(now.getTime() + 7 * 3600e3);
  return new Date(Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate() + dayOffset, hour - 7, minute));
}

const users = [
  { id: "u_admin", name: "Admin Nusa", email: "admin@eticket.id", password: hash("password123"), phone: "081200000001", role: "ADMIN", commissionRate: 0, createdAt: iso(now) },
  { id: "u_agent", name: "Agen Mandiri Travel", email: "agen@eticket.id", password: hash("password123"), phone: "081200000002", role: "AGENT", commissionRate: 5, createdAt: iso(now) },
  { id: "u_cust", name: "Budi Santoso", email: "budi@mail.com", password: hash("password123"), phone: "081200000003", role: "CUSTOMER", commissionRate: 0, createdAt: iso(now) },
];

const operators = [
  { id: "op_ga", name: "Garuda Indonesia", code: "GA", type: "FLIGHT" },
  { id: "op_jt", name: "Lion Air", code: "JT", type: "FLIGHT" },
  { id: "op_kai", name: "KAI Argo", code: "KA", type: "TRAIN" },
  { id: "op_sj", name: "PO Sinar Jaya", code: "SJ", type: "BUS" },
  { id: "op_pelni", name: "PELNI", code: "PN", type: "SHIP" },
];

const routes = [
  { id: "r_jkt_dps", origin: "Jakarta", destination: "Denpasar", durationMin: 110 },
  { id: "r_dps_jkt", origin: "Denpasar", destination: "Jakarta", durationMin: 110 },
  { id: "r_jkt_sby", origin: "Jakarta", destination: "Surabaya", durationMin: 90 },
  { id: "r_jkt_yog", origin: "Jakarta", destination: "Yogyakarta", durationMin: 420 },
  { id: "r_jkt_bdg", origin: "Jakarta", destination: "Bandung", durationMin: 180 },
  { id: "r_sby_mks", origin: "Surabaya", destination: "Makassar", durationMin: 1440 },
];

// [routeId, operatorId, jam, menit, harga, kursi]
const plan = [
  ["r_jkt_dps", "op_ga", 6, 0, 1450000, 60],
  ["r_jkt_dps", "op_jt", 9, 30, 980000, 80],
  ["r_jkt_dps", "op_ga", 15, 15, 1550000, 60],
  ["r_dps_jkt", "op_ga", 8, 0, 1400000, 60],
  ["r_dps_jkt", "op_jt", 18, 0, 950000, 80],
  ["r_jkt_sby", "op_jt", 7, 0, 850000, 80],
  ["r_jkt_sby", "op_ga", 13, 0, 1250000, 60],
  ["r_jkt_yog", "op_kai", 8, 0, 450000, 50],
  ["r_jkt_yog", "op_kai", 20, 0, 380000, 50],
  ["r_jkt_bdg", "op_sj", 6, 0, 120000, 40],
  ["r_jkt_bdg", "op_sj", 14, 0, 120000, 40],
  ["r_sby_mks", "op_pelni", 10, 0, 650000, 200],
];

const schedules = [];
let n = 1;
for (let d = 0; d < 14; d++) {
  plan.forEach(([routeId, operatorId, h, m, price, seats], i) => {
    const route = routes.find((r) => r.id === routeId);
    const dep = wib(d, h, m);
    schedules.push({
      id: `s_${String(n++).padStart(4, "0")}`,
      routeId,
      operatorId,
      departureAt: iso(dep),
      arrivalAt: iso(new Date(dep.getTime() + route.durationMin * 60000)),
      price,
      totalSeats: seats,
      bookedSeats: (i * 7 + d * 3) % 12, // simulasi penjualan lain
    });
  });
}

// Contoh booking lunas milik Budi (jadwal besok, Jakarta → Denpasar)
const demoSchedule = schedules.find((s) => s.routeId === "r_jkt_dps" && new Date(s.departureAt) > wib(1, 0, 0));
demoSchedule.bookedSeats += 2;
const bookings = [
  {
    id: "b_demo1",
    code: "ETKDEMO1",
    userId: "u_cust",
    scheduleId: demoSchedule.id,
    status: "PAID",
    totalAmount: demoSchedule.price * 2,
    contactName: "Budi Santoso",
    contactEmail: "budi@mail.com",
    contactPhone: "081200000003",
    passengers: [
      { id: "p_demo1", fullName: "Budi Santoso", idNumber: "3171010101900001", ticketCode: "TKT-DEMO0001", ticketStatus: "ACTIVE", checkedInAt: null },
      { id: "p_demo2", fullName: "Siti Aminah", idNumber: "3171010101920002", ticketCode: "TKT-DEMO0002", ticketStatus: "ACTIVE", checkedInAt: null },
    ],
    expiresAt: iso(new Date(now.getTime() + 30 * 60000)),
    paidAt: iso(now),
    paymentMethod: "QRIS",
    createdAt: iso(now),
  },
];

const save = (name, rows) => writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(rows, null, 2));
save("users", users);
save("operators", operators);
save("routes", routes);
save("schedules", schedules);
save("bookings", bookings);

console.log(`Seed selesai: ${users.length} user, ${routes.length} rute, ${schedules.length} jadwal, ${bookings.length} booking.`);
