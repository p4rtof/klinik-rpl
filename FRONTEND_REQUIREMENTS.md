# Backend Requirements - Analisis dari Frontend Team

**Date**: 2026-05-08  
**Status**: Penjelasan kebutuhan dari Frontend

---

## 📋 Ringkasan Request Frontend

### Dari Fadhla (Frontend Admin):

#### 1. **Status: Pasien Data Fields**
- ✅ SUDAH ADA: `tanggalLahir` - untuk hitung usia di frontend
- ✅ SUDAH ADA: `jenisKelamin` - untuk tampil jenis kelamin di dashboard
- ✅ SUDAH ADA: `noRm` - nomor rekam medis
- ✅ SUDAH ADA: `id pasien` - UUID

**Endpoint yang affected**: `GET /api/pasien`, `GET /api/pasien/[id]`

---

#### 2. **Filter Data Pasien**
- ✅ SUDAH ADA: Filter berdasarkan `nama` (query param `search`)

**Request clarification**:
- Apakah juga ingin filter berdasarkan `noRm` atau `id`? 
- Atau cukup `nama` aja?

---

#### 3. **Format ID dengan Kode** (FLEXIBLE)
- P0001 untuk pasien ID
- R0001 untuk noRm
- T0001 untuk transaksi (tapi Fadhla decided: tidak perlu, cukup noRm)

**Pertanyaan untuk Aditya**:
- Di backend atau di frontend yang format?
- Atau hardcoded di database setiap kali generate?

---

#### 4. **ID Transaksi vs noRm** (DECIDED)
- **Decision**: Untuk klinik kecil, cukup gunakan `noRm` aja
- Tidak perlu field `idTransaksi` terpisah
- 1 `noRm` = 1 pemeriksaan = 1 tindakan = 1 harga

---

### Dari Aulia (Frontend Dokter):

#### 1. **Dropdown Jenis Tindakan**
Saat dokter periksa pasien, ada dropdown untuk memilih jenis tindakan.

**Pertanyaan untuk Aditya**:
- Apakah list tindakan di backend atau di frontend?
- Jika di backend: butuh endpoint baru `/api/tindakan`
- Jika di frontend: hardcoded di component

---

## ✅ Checklist: Status Sekarang

| Requirement | Status | Catatan |
|---|---|---|
| GET `/api/pasien` dengan field `tanggalLahir` | ✅ SUDAH | Include semua field |
| GET `/api/pasien` dengan field `jenisKelamin` | ✅ SUDAH | Include semua field |
| GET `/api/pasien/[id]` dengan field lengkap | ✅ SUDAH | Include detail pasien |
| Filter pasien by `nama` | ✅ SUDAH | Query param `search` |
| Filter pasien by `noRm` atau `id` | ❓ TANYAKAN | Perlu ditambah atau tidak? |
| Format ID (P0001, R0001) | ❓ TANYAKAN | Backend atau frontend? |
| Endpoint list tindakan | ❓ TANYAKAN | Backend atau frontend? |
| Pembayaran gunakan `noRm` | ✅ DECIDED | Tidak perlu `idTransaksi` |

---

## 🎯 Langkah Selanjutnya

**Untuk Aditya**:

1. **Confirm dengan Frontend**:
   - Perlu filter tambahan (by `noRm` atau `id`)?
   - Format ID mau di mana?
   - List tindakan mau di mana?

2. **Implementasi sesuai feedback**:
   - Jika filter: update query logic di `GET /api/pasien`
   - Jika format ID di backend: buat utility function
   - Jika endpoint tindakan: buat `/api/tindakan`

3. **Test semuanya**: Pastikan koordinasi dengan frontend lancar

---

**NEXT STEP**: Tanyakan Fadhla dan Aulia untuk confirm keputusan di atas.

