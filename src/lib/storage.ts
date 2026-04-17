import type {
  Patient,
  Appointment,
  MedicalRecord,
  Payment,
  User,
  Session,
} from "@/types/klinik";

const STORAGE_KEYS = {
  USERS: "klinik_users",
  PATIENTS: "klinik_patients",
  APPOINTMENTS: "klinik_appointments",
  RECORDS: "klinik_records",
  PAYMENTS: "klinik_payments",
  SESSION: "klinik_session",
} as const;

export function initData() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers: User[] = [
      { username: "ADMIN", role: "ADMIN", password: "admin123" },
      { username: "DOKTER", role: "DOKTER", password: "dokter123" },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }
}

export function getUsers(): User[] {
  initData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
}

export function getPatients(): Patient[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || "[]");
}

export function savePatient(patient: Patient) {
  const patients = getPatients();
  const existingIndex = patients.findIndex((p) => p.id === patient.id);
  if (existingIndex >= 0) {
    patients[existingIndex] = patient;
  } else {
    patients.push(patient);
  }
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
}

export function deletePatient(id: string) {
  const patients = getPatients().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
}

export function getAppointments(): Appointment[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || "[]");
}

export function saveAppointment(appointment: Appointment) {
  const appointments = getAppointments();
  const existingIndex = appointments.findIndex((a) => a.id === appointment.id);
  if (existingIndex >= 0) {
    appointments[existingIndex] = appointment;
  } else {
    appointments.push(appointment);
  }
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
}

export function getRecords(): MedicalRecord[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS) || "[]");
}

export function saveRecord(record: MedicalRecord) {
  const records = getRecords();
  const existingIndex = records.findIndex((r) => r.id === record.id);
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

export function getPayments(): Payment[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || "[]");
}

export function savePayment(payment: Payment) {
  const payments = getPayments();
  const existingIndex = payments.findIndex((p) => p.id === payment.id);
  if (existingIndex >= 0) {
    payments[existingIndex] = payment;
  } else {
    payments.push(payment);
  }
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
}

export function getSession(): Session | null {
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  return session ? JSON.parse(session) : null;
}

export function setSession(session: Session) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export function logout() {
  clearSession();
}
