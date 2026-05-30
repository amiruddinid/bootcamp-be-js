const { findAllCustomer, findCustomerById, 
    findCustomerByCode, insertCustomer, 
    updateCustomerById, deleteCustomerById } = require('./customer.repository');

const getAllCustomer = async () => {
    try {
        const result = await findAllCustomer();
        
        return {
            status: 200,
            data: {
                status: 200,
                message: 'Customers retrieved successfully',
                data: result.data,
                metadata: {
                    total: result.rows
                }
            },
        };
    } catch (error) {
        console.error('Error retrieving customers:', error);
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

const getCustomerById = async (id) => {
    try {
        const result = await findCustomerById(id);
        if (result.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    message: 'Customer not found',
                    data: null
                },
            };
        }
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Customer retrieved successfully'
            },
        };
    } catch (error) {
        console.error('Error retrieving customer:', error);
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

const createCustomer = async (customerData) => {
    try {
        const checkDuplicate = await findCustomerByCode(customerData.CUSTOMER_CODE);
        if (checkDuplicate.rows > 0) {
            return {
                status: 409,
                data: {
                    status: 409,
                    data: null,
                    message: 'Customer with same customer code already exists'
                },
            };
        }
        const result = await insertCustomer(customerData);
        return {
            status: 201,
            data: {
                status: 201,
                data: result.data,
                message: 'Customer created successfully'
            },
        };
    } catch (error) {
        console.error('Error creating customer:', error);
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

const updateCustomer = async (id, customerData) => {
    try {
        const existing = await findCustomerById(id);
        if (existing.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'Customer not found'
                }
            };
        }
        if (existing.data.CUSTOMER_CODE !== customerData.CUSTOMER_CODE) {
            const checkDuplicate = await findCustomerByCode(customerData.CUSTOMER_CODE);
            if (checkDuplicate.rows > 0) {
                return {
                    status: 409,
                    data: {
                        status: 409,
                        data: null,
                        message: 'Customer with same customer code already exists'
                    }
                };
            }
        }
        const result = await updateCustomerById(id, customerData);
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Customer updated successfully'
            }
        };
    } catch (error) {
        console.error('Error updating customer:', error);
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

const deleteCustomer = async (id) => {
    try {
        const existing = await findCustomerById(id);
        if (existing.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'Customer not found'
                }
            };
        }
        const result = await deleteCustomerById(id);
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Customer deleted successfully'
            }
        };
    } catch (err) {
        console.error('Error deleting customer:', err);
        if (err.number === 547) {
            return {
                status: 409,
                data: {
                    status: 409,
                    data: null,
                    message: 'Cannot delete customer because it is referenced by existing records.'
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
    getAllCustomer,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
};
