import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Logout berhasil' },
    { status: 200 }
  );

  // Hapus cookie token
  response.cookies.delete('token');

  return response;
}
