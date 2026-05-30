const { findAllSupplier, findSupplierById, 
    findSupplierByCode, insertSupplier, 
    updateSupplierById, deleteSupplierById } = require('./supplier.repository');

const getAllSupplier = async () => {
    try {
        const result = await findAllSupplier();
        
        return {
            status: 200,
            data: {
                status: 200,
                message: 'Suppliers retrieved successfully',
                data: result.data,
                metadata: {
                    total: result.rows
                }
            },
        };
    } catch (error) {
        console.error('Error retrieving suppliers:', error);
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

const getSupplierById = async (id) => {
    try {
        const result = await findSupplierById(id);
        if (result.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    message: 'Supplier not found',
                    data: null
                },
            };
        }
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Supplier retrieved successfully'
            },
        };
    } catch (error) {
        console.error('Error retrieving supplier:', error);
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

const createSupplier = async (supplierData) => {
    try {
        const checkDuplicate = await findSupplierByCode(supplierData.SUPPLIER_CODE);
        if (checkDuplicate.rows > 0) {
            return {
                status: 409,
                data: {
                    status: 409,
                    data: null,
                    message: 'Supplier with same supplier code already exists'
                },
            };
        }
        const result = await insertSupplier(supplierData);
        return {
            status: 201,
            data: {
                status: 201,
                data: result.data,
                message: 'Supplier created successfully'
            },
        };
    } catch (error) {
        console.error('Error creating supplier:', error);
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

const updateSupplier = async (id, supplierData) => {
    try {
        const existing = await findSupplierById(id);
        if (existing.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'Supplier not found'
                }
            };
        }
        if (existing.data.SUPPLIER_CODE !== supplierData.SUPPLIER_CODE) {
            const checkDuplicate = await findSupplierByCode(supplierData.SUPPLIER_CODE);
            if (checkDuplicate.rows > 0) {
                return {
                    status: 409,
                    data: {
                        status: 409,
                        data: null,
                        message: 'Supplier with same supplier code already exists'
                    }
                };
            }
        }
        const result = await updateSupplierById(id, supplierData);
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Supplier updated successfully'
            }
        };
    } catch (error) {
        console.error('Error updating supplier:', error);
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

const deleteSupplier = async (id) => {
    try {
        const existing = await findSupplierById(id);
        if (existing.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'Supplier not found'
                }
            };
        }
        const result = await deleteSupplierById(id);
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Supplier deleted successfully'
            }
        };
    } catch (err) {
        console.error('Error deleting supplier:', err);
        if (err.number === 547) {
            return {
                status: 409,
                data: {
                    status: 409,
                    data: null,
                    message: 'Cannot delete supplier because it is referenced by existing records.'
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
    getAllSupplier,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
