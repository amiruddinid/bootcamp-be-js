const z = require('zod');

const createUserSchema = z.object({
    USERNAME: z.string().min(1, 'Username is required').max(50),
    PASSWORD: z.string().min(1, 'Password is required'),
    NOREG: z.string().min(1, 'Noreg is required').max(10),
    EMAIL: z.string().email('Invalid email address').max(50),
    ROLE_ID: z.number().int().min(1, 'Role ID is required')
});

const updateUserSchema = z.object({
    PASSWORD: z.string().optional(),
    NOREG: z.string().min(1, 'Noreg is required').max(10),
    EMAIL: z.string().email('Invalid email address').max(50),
    ROLE_ID: z.number().int().min(1, 'Role ID is required')
});

const postUserSchema = z.object({
    body: createUserSchema
});

const putUserSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID (username) is required') 
    }),
    body: updateUserSchema
});

const deleteUserSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID (username) is required') 
    })
});

module.exports = {
    postUserSchema,
    putUserSchema,
    deleteUserSchema
};
