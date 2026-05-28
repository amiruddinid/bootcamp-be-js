const { findAllRole, findRoleById, 
    findRoleByName, insertRole, 
    updateRoleById, deleteRoleById } = require('./role.repository');

const getAllRole = async () => {
    try {
        const getAllRoleResult = await findAllRole(); // panggil fungsi untuk mengambil semua role dari database
        
        return {
            status: 200,
            data: {
                status: 200,
                message: 'Roles retrieved successfully',
                data: getAllRoleResult.data,
                metadata: {
                    total: getAllRoleResult.rows
                }
            },
        };
    } catch (error) {
        console.error('Error retrieving roles:', error);
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

const getRoleById = async (id) => {
    try {
        const getRoleByIdResult = await findRoleById(id); // panggil fungsi untuk mengambil role berdasarkan ID dari database
        if(getRoleByIdResult.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    message: 'Role not found',
                    data: null
                },
            };
        }
        return {
            status: 200,
            data: {
                status: 200,
                data: getRoleByIdResult.data,
                message: 'Role retrieved successfully'
            },
        };
    } catch (error) {
        console.error('Error retrieving role:', error);
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

const createRole = async (roleData) => {
    try {
        const body = roleData; // ambil data dari parameter
        const getRoleByName = await findRoleByName(body.ROLE_NAME); // panggil fungsi untuk mengambil role berdasarkan PART_NUMBER dari database
        if(getRoleByName.rows > 0) {
            return {
                status: 409,
                data: {
                    status: 409,
                    data: null,
                    message: 'Role with same name already exists'
                },
            };
        }
        const result = await insertRole(body); // panggil fungsi untuk memasukkan data role ke database
        return {
            status: 201,
            data: {
                status: 201,
                data: result.data,
                message: 'Role created successfully'
            },
        };
    } catch (error) {
        console.error(error); // log error ke console untuk debugging
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

const updateRole = async (id, roleData) => {
    try {
        const body = roleData; // ambil data dari parameter
        const getRoleByIdResult = await findRoleById(id); // panggil fungsi untuk mengambil role berdasarkan ID dari database
        if(getRoleByIdResult.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'Role not found'
                }
            };
        }
        if(getRoleByIdResult.data.ROLE_NAME !== body.ROLE_NAME) { // cek jika ROLE_NAME di request body berbeda dengan ROLE_NAME di database
            const getRoleByName = await findRoleByName(body.ROLE_NAME); // panggil fungsi untuk mengambil role berdasarkan ROLE_NAME dari database
            if(getRoleByName.rows > 0) {
                return {
                    status: 409,
                    data: {
                        status: 409,
                        data: null,
                        message: 'Role with same name already exists'
                    }
                };
            }
        }
        const result = await updateRoleById(id, body); // panggil fungsi untuk mengupdate data role di database
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Data role berhasil diupdate'
            }
        };
    } catch (error) {
        console.error(error); // log error ke console untuk debugging
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

const deleteRole = async (id) => {
    try {
        const getRoleByIdResult = await findRoleById(id); // panggil fungsi untuk mengambil role berdasarkan ID dari database
        if(getRoleByIdResult.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'Role not found'
                }
            };
        }
        const result = await deleteRoleById(id); // panggil fungsi untuk menghapus data role di database
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Data role berhasil dihapus'
            }
        };
    } catch (error) {
        console.error(error); // log error ke console untuk debugging
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
    getAllRole,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
}