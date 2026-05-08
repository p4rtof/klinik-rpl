import { prisma } from './prisma';

/**
 * Generate formatted IDs untuk Pasien dan noRm
 * Pasien: P0001, P0002, ...
 * NoRm:   R0001, R0002, ...
 */

export async function generatePasienId(): Promise<string> {
  const count = await prisma.pasien.count();
  const nextNum = count + 1;
  return `P${String(nextNum).padStart(4, '0')}`;
}

export async function generateNoRm(): Promise<string> {
  const count = await prisma.pasien.count();
  const nextNum = count + 1;
  return `R${String(nextNum).padStart(4, '0')}`;
}

/**
 * Shorthand untuk generate keduanya sekaligus
 */
export async function generatePasienIds(): Promise<{ id: string; noRm: string }> {
  const id = await generatePasienId();
  const noRm = await generateNoRm();
  return { id, noRm };
}
