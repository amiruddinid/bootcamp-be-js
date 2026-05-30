const z = require('zod');

const createCustomerSchema = z.object({
    CUSTOMER_CODE: z.string().min(1, 'Customer code is required'),
    NAME: z.string().min(1, 'Name is required'),
    TYPE: z.string().min(1, 'Type is required'),
    ADDRESS: z.string().min(1, 'Address is required'),
    PHONE: z.string().min(1, 'Phone is required')
});

const postCustomerSchema = z.object({
    body: createCustomerSchema
});

const putCustomerSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') 
    }),
    body: createCustomerSchema
});

const deleteCustomerSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') 
    })
});

module.exports = {
    postCustomerSchema,
    putCustomerSchema,
    deleteCustomerSchema
};
