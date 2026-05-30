const { findAllUsers, findUserById, insertUser, updateUserById, deleteUserById } = require('./user.repository');
const { hashPassword } = require('../../../utils/bcrypt');

const getAllUsers = async () => {
    try {
        const result = await findAllUsers();
        
        return {
            status: 200,
            data: {
                status: 200,
                message: 'Users retrieved successfully',
                data: result.data,
                metadata: {
                    total: result.rows
                }
            },
        };
    } catch (error) {
        console.error('Error retrieving users:', error);
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

const getUserById = async (username) => {
    try {
        const result = await findUserById(username);
        if (result.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    message: 'User not found',
                    data: null
                },
            };
        }
        
        // Strip the password hash before sending to client
        const userData = { ...result.data };
        delete userData.PASSWORD;

        return {
            status: 200,
            data: {
                status: 200,
                data: userData,
                message: 'User retrieved successfully'
            },
        };
    } catch (error) {
        console.error('Error retrieving user:', error);
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

const createUser = async (userData) => {
    try {
        const checkDuplicate = await findUserById(userData.USERNAME);
        if (checkDuplicate.rows > 0) {
            return {
                status: 409,
                data: {
                    status: 409,
                    data: null,
                    message: 'Username already exists'
                },
            };
        }
        
        const hashedPassword = await hashPassword(userData.PASSWORD);
        const result = await insertUser({
            ...userData,
            PASSWORD: hashedPassword
        });

        return {
            status: 201,
            data: {
                status: 201,
                data: result.data,
                message: 'User created successfully'
            },
        };
    } catch (error) {
        console.error('Error creating user:', error);
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

const updateUser = async (username, userData) => {
    try {
        const existing = await findUserById(username);
        if (existing.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'User not found'
                }
            };
        }
        
        let updateData = { ...userData };
        if (userData.PASSWORD) {
            const hashedPassword = await hashPassword(userData.PASSWORD);
            updateData.PASSWORD = hashedPassword;
        }

        const result = await updateUserById(username, updateData);
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'User updated successfully'
            }
        };
    } catch (error) {
        console.error('Error updating user:', error);
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

const deleteUser = async (username) => {
    try {
        const existing = await findUserById(username);
        if (existing.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'User not found'
                }
            };
        }
        const result = await deleteUserById(username);
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'User deleted successfully'
            }
        };
    } catch (err) {
        console.error('Error deleting user:', err);
        if (err.number === 547) {
            return {
                status: 409,
                data: {
                    status: 409,
                    data: null,
                    message: 'Cannot delete user because they are referenced by existing records.'
                },
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

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
