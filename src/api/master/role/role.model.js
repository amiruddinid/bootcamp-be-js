const z = require('zod'); // import library zod untuk validasi input

const createRoleSchema = z.object({
    ROLE_NAME: z.string().min(1, 'Role name is required') // validasi role name harus string dan tidak kosong
});

const postRoleSchema = z.object({
    body: createRoleSchema
});

const putRoleSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') 
    }), // validasi parameter id harus string dan tidak kosong
    body: createRoleSchema
});

const deleteRoleSchema = z.object({
    params: z.object({ 
        id: z.string().min(1, 'ID is required') 
    }),
});

module.exports = {
    postRoleSchema,
    putRoleSchema,
    deleteRoleSchema
};