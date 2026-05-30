const { findAllCarModel, findCarModelById, 
    findCarModelByCode, insertCarModel, 
    updateCarModelById, deleteCarModelById } = require('./carModel.repository');

const getAllCarModel = async () => {
    try {
        const result = await findAllCarModel();
        
        return {
            status: 200,
            data: {
                status: 200,
                message: 'Car models retrieved successfully',
                data: result.data,
                metadata: {
                    total: result.rows
                }
            },
        };
    } catch (error) {
        console.error('Error retrieving car models:', error);
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

const getCarModelById = async (id) => {
    try {
        const result = await findCarModelById(id);
        if (result.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    message: 'Car model not found',
                    data: null
                },
            };
        }
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Car model retrieved successfully'
            },
        };
    } catch (error) {
        console.error('Error retrieving car model:', error);
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

const createCarModel = async (carModelData) => {
    try {
        const checkDuplicate = await findCarModelByCode(carModelData.MODEL_CODE);
        if (checkDuplicate.rows > 0) {
            return {
                status: 409,
                data: {
                    status: 409,
                    data: null,
                    message: 'Car model with same model code already exists'
                },
            };
        }
        const result = await insertCarModel(carModelData);
        return {
            status: 201,
            data: {
                status: 201,
                data: result.data,
                message: 'Car model created successfully'
            },
        };
    } catch (error) {
        console.error('Error creating car model:', error);
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

const updateCarModel = async (id, carModelData) => {
    try {
        const existing = await findCarModelById(id);
        if (existing.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'Car model not found'
                }
            };
        }
        if (existing.data.MODEL_CODE !== carModelData.MODEL_CODE) {
            const checkDuplicate = await findCarModelByCode(carModelData.MODEL_CODE);
            if (checkDuplicate.rows > 0) {
                return {
                    status: 409,
                    data: {
                        status: 409,
                        data: null,
                        message: 'Car model with same model code already exists'
                    }
                };
            }
        }
        const result = await updateCarModelById(id, carModelData);
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Car model updated successfully'
            }
        };
    } catch (error) {
        console.error('Error updating car model:', error);
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

const deleteCarModel = async (id) => {
    try {
        const existing = await findCarModelById(id);
        if (existing.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'Car model not found'
                }
            };
        }
        const result = await deleteCarModelById(id);
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Car model deleted successfully'
            }
        };
    } catch (err) {
        console.error('Error deleting car model:', err);
        if (err.number === 547) {
            return {
                status: 409,
                data: {
                    status: 409,
                    data: null,
                    message: 'Cannot delete car model because it is referenced by existing records.'
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
    getAllCarModel,
    getCarModelById,
    createCarModel,
    updateCarModel,
    deleteCarModel
};
