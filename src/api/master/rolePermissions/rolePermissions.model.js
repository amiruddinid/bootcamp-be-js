const z = require('zod');

const createRolePermissionsSchema = z.object({
    ROLE_ID: z.number().int().min(1, 'Role ID is required'),
    FUNCTION: z.string().min(1, 'Function is required'),
    FEATURE: z.string().min(1, 'Feature is required')
});

const postRolePermissionsSchema = z.object({
    body: createRolePermissionsSchema
});

const putRolePermissionsSchema = z.object({
    params: z.object({ 
        id: z.string().regex(/^\d+$/, 'ID must be a numeric string').transform(Number)
    }),
    body: createRolePermissionsSchema
});

const deleteRolePermissionsSchema = z.object({
    params: z.object({ 
        id: z.string().regex(/^\d+$/, 'ID must be a numeric string').transform(Number)
    })
});

module.exports = {
    postRolePermissionsSchema,
    putRolePermissionsSchema,
    deleteRolePermissionsSchema
};
