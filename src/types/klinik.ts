export interface User {
  username: string;
  role: "ADMIN" | "DOKTER";
  password: string;
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
  keluhan: string;
  date: string;
  time: string;
  status: "antri" | "periksa" | "selesai";
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  diagnosis: string;
  treatment: string;
  resep: string;
  doctorNote?: string;
}

export interface Payment {
  id: string;
  patientId: string;
  patientName: string;
  amount: number;
  date: string;
  status: "pending" | "paid";
  receiptNo: string;
}

// Session type
export interface Session {
  username: string;
  role: "ADMIN" | "DOKTER";
}
