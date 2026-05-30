const z = require('zod');

const createCarModelSchema = z.object({
    MODEL_CODE: z.string().min(1, 'Model code is required'),
    MODEL_NAME: z.string().min(1, 'Model name is required'),
    COLOR: z.string().min(1, 'Color is required'),
    TRANSMISSION_TYPE: z.string().min(1, 'Transmission type is required')
});

const postCarModelSchema = z.object({
    body: createCarModelSchema
});

const putCarModelSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') 
    }),
    body: createCarModelSchema
});

const deleteCarModelSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') 
    })
});

module.exports = {
    postCarModelSchema,
    putCarModelSchema,
    deleteCarModelSchema
};
