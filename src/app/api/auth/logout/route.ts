import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Logout berhasil' },
    { status: 200 }
  );

  // Hapus cookie token dengan path yang sesuai
  response.cookies.set({
    name: 'token',
    value: '',
    path: '/',
    expires: new Date(0), // Set kedaluwarsa ke masa lalu
  });

  return response;
}