export type Role = "ADMIN" | "DOKTER";

export interface Session {
  username: string;
  role: Role;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  address: string;
  keluhan: string;
  createdDate: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  keluhan: string;
  status: "antri" | "periksa" | "selesai" | "batal";
  diagnosa?: string;
  resep?: string;
  dokterId?: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  patientName: string;
  amount: number;
  date: string;
  status: "lunas" | "pending";
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  diagnosa: string;
  resep: string;
  dokterId: string;
}
