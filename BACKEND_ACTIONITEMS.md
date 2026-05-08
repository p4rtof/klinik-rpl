# 🎯 Backend TODO - Finalized Requirements

**Date**: 2026-05-08  
**Status**: Ready to implement

---

## ✅ Confirmed Decisions

| Item | Decision | Notes |
|---|---|---|
| Filter Data Pasien | Filter by **nama** AND **noRm/id** | UPDATE endpoint |
| Generate ID Format | **Di backend** (P0001, R0001, etc) | Buat utility function |
| Jenis Tindakan | **TBD nanti** | Skip untuk sekarang |
| ID Transaksi | **Tidak perlu** - gunakan `noRm` aja | No schema change |
| jenisKelamin & tanggalLahir | **✅ SUDAH ADA** di response | Confirm ke Fadhla |

---

## 📝 Action Items untuk Aditya

### 1️⃣ **UPDATE: GET /api/pasien - Add Filter by noRm**

**Current**: Filter hanya by `nama`
```
GET /api/pasien?search=nama
```

**New**: Filter by `nama` OR `noRm` atau `id`
```
GET /api/pasien?search=John          // cari by nama
GET /api/pasien?search=abc123def     // cari by noRm
GET /api/pasien?search=uuid-here     // cari by id
```

**Implementation**:
- Update query `where` logic di `src/app/api/pasien/route.ts`
- Gunakan `OR` condition untuk search multiple fields

---

### 2️⃣ **IMPLEMENT: ID Format Generator**

**Requirement**: Generate ID dengan format:
- Pasien: `P0001`, `P0002`, `P0003`, ...
- noRm: `R0001`, `R0002`, `R0003`, ...
- Pembayaran: Gunakan `noRm` (no separate ID needed)

**Where to implement**:

**Option A: Prisma Default Value** (Recommended)
```prisma
model Pasien {
  id    String @id @default(dbgenerated("'P' || printf('%04d', ROW_NUMBER() OVER())"))
  noRm  String @unique @default(dbgenerated("'R' || printf('%04d', ROW_NUMBER() OVER())"))
}
```

**Option B: Backend Utility Function**
```typescript
// src/lib/id-generator.ts
export async function generatePasienId() {
  const count = await prisma.pasien.count();
  return `P${String(count + 1).padStart(4, '0')}`;
}
```

**Option C: Hybrid** (Generate + Database trigger)

**Rekomendasi Aditya**: Mana yang lebih feasible untuk SQLite?

---

### 3️⃣ **CLARIFY: jenisKelamin & tanggalLahir - SUDAH ADA!**

**Status**: ✅ **SUDAH DI-INCLUDE** di response

Endpoints yang sudah return field ini:
- `GET /api/pasien` → return semua pasien dengan field lengkap (termasuk jenisKelamin, tanggalLahir)
- `GET /api/pasien/[id]` → return detail pasien dengan field lengkap

**Action**: Confirm ke Fadhla bahwa field ini sudah ada di response.

Example response:
```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "noRm": "R0001",
    "nama": "John Doe",
    "jenisKelamin": "LAKI_LAKI",      // ← SUDAH ADA
    "tanggalLahir": "1990-01-15",      // ← SUDAH ADA
    "noTelepon": "081234567890",
    "alamat": "Jl. Merdeka No. 123",
    "createdAt": "2026-05-08T...",
    "updatedAt": "2026-05-08T..."
  }
}
```

---

## 📋 Implementation Checklist

- [ ] **Item 1**: Filter by noRm (UPDATE endpoint)
- [ ] **Item 2**: ID Format Generator (NEW utility)
- [ ] **Item 3**: Confirm jenisKelamin/tanggalLahir (INFO ke Frontend)

---

## 🔗 Files to Modify

1. `src/app/api/pasien/route.ts` - Filter logic
2. `src/lib/id-generator.ts` - ID generation (NEW)
3. `prisma/schema.prisma` - IF menggunakan Option A
4. Docs untuk explain format ID

---

## 📞 Pertanyaan untuk Aditya

1. **ID Generator**: Pakai Option A, B, atau C?
2. **Format lainnya**: Ada field lain yang perlu format kode? (milik dokter, dll)
3. **Apakah Fadhla bisa test** untuk confirm jenisKelamin & tanggalLahir sudah muncul?

---

*Prepared by: Copilot | Date: 2026-05-08*
