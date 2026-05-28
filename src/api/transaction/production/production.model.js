const z = require('zod'); // Import library Zod untuk melakukan validasi input request

// Schema validasi untuk payload pembuatan transaksi produksi baru
const createProductionSchema = z.object({
    CAR_MODEL_ID: z.string().min(1, 'Car Model ID is required'), // ID Model mobil wajib diisi
    VIN: z.string().min(1, 'VIN is required'),                     // Nomor rangka kendaraan wajib diisi
    ENGINE_NUMBER: z.string().min(1, 'Engine number is required')  // Nomor mesin wajib diisi
});

// Schema validasi untuk memperbarui status transaksi produksi
const updateProductionStatusSchema = z.object({
    // Status wajib diisi dan dibatasi nilainya hanya pada 3 enum berikut
    STATUS: z.enum(['In Progress', 'Completed', 'Cancelled'], {
        errorMap: () => ({ message: 'Status must be either "In Progress", "Completed", or "Cancelled"' })
    }),
    NOTES: z.string().optional() // Catatan opsional tambahan untuk riwayat perubahan status
});

// Zod Wrapper untuk validasi request BODY pada endpoint POST
const postProductionSchema = z.object({
    body: createProductionSchema
});

// Zod Wrapper untuk validasi PARAMS dan BODY pada endpoint PUT status
const putProductionStatusSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') // ID produksi di path parameter wajib diisi
    }),
    body: updateProductionStatusSchema
});

// Zod Wrapper untuk validasi PARAMS pada endpoint GET detail by ID
const getProductionByIdSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') // ID produksi di path parameter wajib diisi
    }),
});

module.exports = {
    postProductionSchema,
    putProductionStatusSchema,
    getProductionByIdSchema
};
