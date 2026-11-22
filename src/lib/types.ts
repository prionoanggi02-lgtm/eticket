export type Role = "ADMIN" | "AGENT" | "CUSTOMER";
export type TransportType = "FLIGHT" | "BUS" | "TRAIN" | "SHIP";
export type BookingStatus = "PENDING" | "PAID" | "CANCELLED" | "EXPIRED";
export type TicketStatus = "ACTIVE" | "USED" | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // format "salt:hash" (scrypt)
  phone?: string;
  role: Role;
  commissionRate: number; // persen komisi untuk agen
  createdAt: string;
}

export interface Operator {
  id: string;
  name: string;
  code: string;
  type: TransportType;
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  durationMin: number;
}

export interface Schedule {
  id: string;
  routeId: string;
  operatorId: string;
  departureAt: string;
  arrivalAt: string;
  price: number;
  totalSeats: number;
  bookedSeats: number;
}

export interface Passenger {
  id: string;
  fullName: string;
  idNumber: string;
  ticketCode: string | null;
  ticketStatus: TicketStatus | null;
  checkedInAt: string | null;
}

export interface Booking {
  id: string;
  code: string;
  userId: string;
  scheduleId: string;
  status: BookingStatus;
  totalAmount: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  passengers: Passenger[];
  expiresAt: string;
  paidAt: string | null;
  paymentMethod: string | null;
  createdAt: string;
}

export type Tables = {
  users: User;
  operators: Operator;
  routes: Route;
  schedules: Schedule;
  bookings: Booking;
};

export type ScheduleDetail = Schedule & { route: Route; operator: Operator };

export type FormState =
  | { error?: string; success?: string; values?: Record<string, string> }
  | undefined;
