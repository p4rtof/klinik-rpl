import type { Session, Patient, Appointment, Payment, MedicalRecord } from "@/types/klinik";

const KEYS = {
  SESSION: "klinik_session",
  PATIENTS: "klinik_patients",
  APPOINTMENTS: "klinik_appointments",
  PAYMENTS: "klinik_payments",
  RECORDS: "klinik_records",
};

function isBrowser() {
  return typeof window !== "undefined";
}

// ── Session ──────────────────────────────────────────────
export function getSession(): Session | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(KEYS.SESSION);
  return raw ? JSON.parse(raw) : null;
}
export function setSession(session: Session) {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
}
export function clearSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.SESSION);
}

// ── Patients ─────────────────────────────────────────────
export function getPatients(): Patient[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(KEYS.PATIENTS);
  return raw ? JSON.parse(raw) : [];
}
export function savePatient(patient: Patient) {
  const list = getPatients();
  const idx = list.findIndex((p) => p.id === patient.id);
  if (idx >= 0) list[idx] = patient;
  else list.push(patient);
  localStorage.setItem(KEYS.PATIENTS, JSON.stringify(list));
}
export function deletePatient(id: string) {
  const list = getPatients().filter((p) => p.id !== id);
  localStorage.setItem(KEYS.PATIENTS, JSON.stringify(list));
}

// ── Appointments ──────────────────────────────────────────
export function getAppointments(): Appointment[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(KEYS.APPOINTMENTS);
  return raw ? JSON.parse(raw) : [];
}
export function saveAppointment(apt: Appointment) {
  const list = getAppointments();
  const idx = list.findIndex((a) => a.id === apt.id);
  if (idx >= 0) list[idx] = apt;
  else list.push(apt);
  localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(list));
}
export function deleteAppointment(id: string) {
  const list = getAppointments().filter((a) => a.id !== id);
  localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(list));
}

// ── Payments ──────────────────────────────────────────────
export function getPayments(): Payment[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(KEYS.PAYMENTS);
  return raw ? JSON.parse(raw) : [];
}
export function savePayment(payment: Payment) {
  const list = getPayments();
  const idx = list.findIndex((p) => p.id === payment.id);
  if (idx >= 0) list[idx] = payment;
  else list.push(payment);
  localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(list));
}

// ── Medical Records ───────────────────────────────────────
export function getMedicalRecords(): MedicalRecord[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(KEYS.RECORDS);
  return raw ? JSON.parse(raw) : [];
}
export function saveMedicalRecord(record: MedicalRecord) {
  const list = getMedicalRecords();
  const idx = list.findIndex((r) => r.id === record.id);
  if (idx >= 0) list[idx] = record;
  else list.push(record);
  localStorage.setItem(KEYS.RECORDS, JSON.stringify(list));
}

// ── Seed Data ─────────────────────────────────────────────
export function initData() {
  if (!isBrowser()) return;
  if (getPatients().length > 0) return; // already seeded

  const today = new Date().toISOString().split("T")[0];

  const patients: Patient[] = [
    { id: "1", name: "Rahmawati", age: 20, phone: "081234567890", address: "Jl. Merdeka No. 1", keluhan: "Pusing dan demam sejak kemarin", createdDate: today },
    { id: "2", name: "Budi Santoso", age: 35, phone: "082345678901", address: "Jl. Sudirman No. 5", keluhan: "Batuk berdahak", createdDate: today },
    { id: "3", name: "Siti Nurhaliza", age: 28, phone: "083456789012", address: "Jl. Gatot Subroto No. 3", keluhan: "Sakit perut", createdDate: today },
  ];
  localStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients));

  const appointments: Appointment[] = [
    { id: "a1", patientId: "1", patientName: "Rahmawati", date: today, time: "08:00", keluhan: "Pusing dan demam", status: "antri" },
    { id: "a2", patientId: "2", patientName: "Budi Santoso", date: today, time: "09:00", keluhan: "Batuk berdahak", status: "antri" },
    { id: "a3", patientId: "3", patientName: "Siti Nurhaliza", date: today, time: "10:00", keluhan: "Sakit perut", status: "selesai", diagnosa: "Gastritis", resep: "Antasida 3x1" },
  ];
  localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));

  const payments: Payment[] = [
    { id: "p1", appointmentId: "a3", patientName: "Siti Nurhaliza", amount: 150000, date: today, status: "lunas" },
  ];
  localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));
}
