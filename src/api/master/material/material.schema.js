const { z } = require('zod'); // import library zod untuk membuat schema validasi


// Schema untuk validasi input saat menghapus material berdasarkan ID
const deleteMaterialByIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, { message: "ID material harus diisi" })   
    })
});

const createMaterialSchema = z.object({
    body: z.object({
        PART_NUMBER: z.string().min(1, { message: "PART_NUMBER harus diisi" }),
        NAME: z.string().min(1, { message: "NAME harus diisi" }),
        CATEGORY: z.string().optional(),
        UNIT: z.string().min(1, { message: "UNIT harus diisi" }),
        SUPPLIER_ID: z.string().min(1, { message: "SUPPLIER_ID harus diisi" }),
    })
})

// Export semua schema yang sudah dibuat
module.exports = {
    deleteMaterialByIdSchema,
    createMaterialSchema
}