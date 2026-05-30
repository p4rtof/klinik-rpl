import { jwtVerify, SignJWT } from 'jose';

export const JWT_SECRET_KEY = process.env.JWT_SECRET || 'super_secret_klinik_key_2026';
const key = new TextEncoder().encode(JWT_SECRET_KEY);

export interface JwtPayload {
  id: string;
  username: string;
  role: 'ADMIN' | 'DOKTER';
  namaLengkap: string;
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(key);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
