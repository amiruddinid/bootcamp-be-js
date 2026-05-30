const z = require('zod');

const createLogisticSchema = z.object({
    VENDOR_CODE: z.string().min(1, 'Vendor code is required'),
    COMPANY_NAME: z.string().min(1, 'Company name is required'),
    FLEET_TYPE: z.string().min(1, 'Fleet type is required'),
    CONTACT_NUMBER: z.string().min(1, 'Contact number is required')
});

const postLogisticSchema = z.object({
    body: createLogisticSchema
});

const putLogisticSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') 
    }),
    body: createLogisticSchema
});

const deleteLogisticSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') 
    })
});

module.exports = {
    postLogisticSchema,
    putLogisticSchema,
    deleteLogisticSchema
};
