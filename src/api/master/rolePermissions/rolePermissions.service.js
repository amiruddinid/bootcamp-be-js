const { findAllRolePermissions, findRolePermissionsById, 
    findRolePermissionsByDetails, insertRolePermissions, 
    updateRolePermissionsById, deleteRolePermissionsById } = require('./rolePermissions.repository');

const getAllRolePermissions = async () => {
    try {
        const result = await findAllRolePermissions();
        
        return {
            status: 200,
            data: {
                status: 200,
                message: 'Role permissions retrieved successfully',
                data: result.data,
                metadata: {
                    total: result.rows
                }
            },
        };
    } catch (error) {
        console.error('Error retrieving role permissions:', error);
        return {
            status: 500,
            data: {
                status: 500,
                data: null,
                message: 'Internal Server Error'
            },
        };
    }
};

const getRolePermissionsById = async (id) => {
    try {
        const result = await findRolePermissionsById(id);
        if (result.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    message: 'Role permission not found',
                    data: null
                },
            };
        }
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Role permission retrieved successfully'
            },
        };
    } catch (error) {
        console.error('Error retrieving role permission:', error);
        return {
            status: 500,
            data: {
                status: 500,
                data: null,
                message: 'Internal Server Error'
            },
        };
    }
};

const createRolePermissions = async (rolePermissionsData) => {
    try {
        const checkDuplicate = await findRolePermissionsByDetails(
            rolePermissionsData.ROLE_ID, 
            rolePermissionsData.FUNCTION, 
            rolePermissionsData.FEATURE
        );
        if (checkDuplicate.rows > 0) {
            return {
                status: 409,
                data: {
                    status: 409,
                    data: null,
                    message: 'This function and feature permission mapping already exists for this role'
                },
            };
        }
        const result = await insertRolePermissions(rolePermissionsData);
        return {
            status: 201,
            data: {
                status: 201,
                data: result.data,
                message: 'Role permission mapping created successfully'
            },
        };
    } catch (error) {
        console.error('Error creating role permission mapping:', error);
        if (error.number === 547) {
            return {
                status: 400,
                data: {
                    status: 400,
                    data: null,
                    message: 'Invalid Role ID. Please verify the role exists.'
                }
            };
        }
        return {
            status: 500,
            data: {
                status: 500,
                data: null,
                message: 'Internal Server Error'
            },
        };
    }
};

const updateRolePermissions = async (id, rolePermissionsData) => {
    try {
        const existing = await findRolePermissionsById(id);
        if (existing.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'Role permission not found'
                }
            };
        }
        if (existing.data.ROLE_ID !== rolePermissionsData.ROLE_ID || 
            existing.data.FUNCTION !== rolePermissionsData.FUNCTION || 
            existing.data.FEATURE !== rolePermissionsData.FEATURE) {
            const checkDuplicate = await findRolePermissionsByDetails(
                rolePermissionsData.ROLE_ID, 
                rolePermissionsData.FUNCTION, 
                rolePermissionsData.FEATURE
            );
            if (checkDuplicate.rows > 0) {
                return {
                    status: 409,
                    data: {
                        status: 409,
                        data: null,
                        message: 'This function and feature permission mapping already exists for this role'
                    }
                };
            }
        }
        const result = await updateRolePermissionsById(id, rolePermissionsData);
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Role permission mapping updated successfully'
            }
        };
    } catch (error) {
        console.error('Error updating role permission mapping:', error);
        if (error.number === 547) {
            return {
                status: 400,
                data: {
                    status: 400,
                    data: null,
                    message: 'Invalid Role ID. Please verify the role exists.'
                }
            };
        }
        return {
            status: 500,
            data: {
                status: 500,
                data: null,
                message: 'Internal Server Error'
            },
        };
    }
};

const deleteRolePermissions = async (id) => {
    try {
        const existing = await findRolePermissionsById(id);
        if (existing.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'Role permission not found'
                }
            };
        }
        const result = await deleteRolePermissionsById(id);
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Role permission mapping deleted successfully'
            }
        };
    } catch (err) {
        console.error('Error deleting role permission mapping:', err);
        return {
            status: 500,
            data: {
                status: 500,
                data: null,
                message: 'Internal Server Error'
            },
        };
    }
};

module.exports = {
    getAllRolePermissions,
    getRolePermissionsById,
    createRolePermissions,
    updateRolePermissions,
    deleteRolePermissions
};
