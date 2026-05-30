const z = require('zod');

const createBomSchema = z.object({
    CAR_MODEL_ID: z.string().min(1, 'Car Model ID is required'),
    INVENTORY_ID: z.string().min(1, 'Inventory ID is required'),
    QTY_REQUIRED: z.number().int().min(1, 'Quantity required must be at least 1')
});

const postBomSchema = z.object({
    body: createBomSchema
});

const putBomSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') 
    }),
    body: createBomSchema
});

const deleteBomSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') 
    })
});

module.exports = {
    postBomSchema,
    putBomSchema,
    deleteBomSchema
};
