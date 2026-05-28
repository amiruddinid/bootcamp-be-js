const z = require('zod'); // import library zod untuk validasi input

const createMaterialSchema = z.object({
    PART_NUMBER: z.string().min(1, 'Part number is required'), // validasi part number harus string dan tidak kosong
    NAME: z.string().min(1, 'Name is required'), // validasi name harus string dan tidak kosong
    CATEGORY: z.string().min(1, 'Category is required'), // validasi category harus string dan tidak kosong
    UNIT: z.string().min(1, 'Unit is required'), // validasi unit harus string dan tidak kosong
    SUPPLIER_ID: z.string().min(1, 'Supplier ID is required')
});

const postMaterialSchema = z.object({
    body: createMaterialSchema
});

const putMaterialSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') 
    }), // validasi parameter id harus string dan tidak kosong
    body: createMaterialSchema
});

const deleteMaterialSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') 
    }),
});

module.exports = {
    postMaterialSchema,
    putMaterialSchema,
    deleteMaterialSchema
};