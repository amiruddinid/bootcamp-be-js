const z = require('zod');

const createSupplierSchema = z.object({
    SUPPLIER_CODE: z.string().min(1, 'Supplier code is required'),
    NAME: z.string().min(1, 'Name is required'),
    CONTACT_PERSON: z.string().min(1, 'Contact person is required'),
    PHONE: z.string().min(1, 'Phone is required'),
    ADDRESS: z.string().min(1, 'Address is required'),
    IS_ACTIVE: z.boolean().optional()
});

const postSupplierSchema = z.object({
    body: createSupplierSchema
});

const putSupplierSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') 
    }),
    body: createSupplierSchema
});

const deleteSupplierSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') 
    })
});

module.exports = {
    postSupplierSchema,
    putSupplierSchema,
    deleteSupplierSchema
};
