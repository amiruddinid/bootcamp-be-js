const { findAllBom, findBomById, 
    findBomByDetails, insertBom, 
    updateBomById, deleteBomById } = require('./bom.repository');

const getAllBom = async () => {
    try {
        const result = await findAllBom();
        
        return {
            status: 200,
            data: {
                status: 200,
                message: 'BOMs retrieved successfully',
                data: result.data,
                metadata: {
                    total: result.rows
                }
            },
        };
    } catch (error) {
        console.error('Error retrieving BOMs:', error);
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

const getBomById = async (id) => {
    try {
        const result = await findBomById(id);
        if (result.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    message: 'BOM not found',
                    data: null
                },
            };
        }
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'BOM retrieved successfully'
            },
        };
    } catch (error) {
        console.error('Error retrieving BOM:', error);
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

const createBom = async (bomData) => {
    try {
        const checkDuplicate = await findBomByDetails(bomData.CAR_MODEL_ID, bomData.INVENTORY_ID);
        if (checkDuplicate.rows > 0) {
            return {
                status: 409,
                data: {
                    status: 409,
                    data: null,
                    message: 'BOM item for this Car Model and Inventory already exists'
                },
            };
        }
        const result = await insertBom(bomData);
        return {
            status: 201,
            data: {
                status: 201,
                data: result.data,
                message: 'BOM created successfully'
            },
        };
    } catch (error) {
        console.error('Error creating BOM:', error);
        if (error.number === 547) {
            return {
                status: 400,
                data: {
                    status: 400,
                    data: null,
                    message: 'Invalid Car Model ID or Inventory ID. Please verify referential IDs exist.'
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

const updateBom = async (id, bomData) => {
    try {
        const existing = await findBomById(id);
        if (existing.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'BOM not found'
                }
            };
        }
        if (existing.data.CAR_MODEL_ID !== bomData.CAR_MODEL_ID || existing.data.INVENTORY_ID !== bomData.INVENTORY_ID) {
            const checkDuplicate = await findBomByDetails(bomData.CAR_MODEL_ID, bomData.INVENTORY_ID);
            if (checkDuplicate.rows > 0) {
                return {
                    status: 409,
                    data: {
                        status: 409,
                        data: null,
                        message: 'BOM item for this Car Model and Inventory already exists'
                    }
                };
            }
        }
        const result = await updateBomById(id, bomData);
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'BOM updated successfully'
            }
        };
    } catch (error) {
        console.error('Error updating BOM:', error);
        if (error.number === 547) {
            return {
                status: 400,
                data: {
                    status: 400,
                    data: null,
                    message: 'Invalid Car Model ID or Inventory ID. Please verify referential IDs exist.'
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

const deleteBom = async (id) => {
    try {
        const existing = await findBomById(id);
        if (existing.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'BOM not found'
                }
            };
        }
        const result = await deleteBomById(id);
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'BOM deleted successfully'
            }
        };
    } catch (err) {
        console.error('Error deleting BOM:', err);
        if (err.number === 547) {
            return {
                status: 409,
                data: {
                    status: 409,
                    data: null,
                    message: 'Cannot delete BOM because it is referenced by existing records.'
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
    getAllBom,
    getBomById,
    createBom,
    updateBom,
    deleteBom
};
