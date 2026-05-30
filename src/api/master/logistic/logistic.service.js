const { findAllLogistic, findLogisticById, 
    findLogisticByCode, insertLogistic, 
    updateLogisticById, deleteLogisticById } = require('./logistic.repository');

const getAllLogistic = async () => {
    try {
        const result = await findAllLogistic();
        
        return {
            status: 200,
            data: {
                status: 200,
                message: 'Logistics retrieved successfully',
                data: result.data,
                metadata: {
                    total: result.rows
                }
            },
        };
    } catch (error) {
        console.error('Error retrieving logistics:', error);
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

const getLogisticById = async (id) => {
    try {
        const result = await findLogisticById(id);
        if (result.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    message: 'Logistic not found',
                    data: null
                },
            };
        }
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Logistic retrieved successfully'
            },
        };
    } catch (error) {
        console.error('Error retrieving logistic:', error);
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

const createLogistic = async (logisticData) => {
    try {
        const checkDuplicate = await findLogisticByCode(logisticData.VENDOR_CODE);
        if (checkDuplicate.rows > 0) {
            return {
                status: 409,
                data: {
                    status: 409,
                    data: null,
                    message: 'Logistic with same vendor code already exists'
                },
            };
        }
        const result = await insertLogistic(logisticData);
        return {
            status: 201,
            data: {
                status: 201,
                data: result.data,
                message: 'Logistic created successfully'
            },
        };
    } catch (error) {
        console.error('Error creating logistic:', error);
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

const updateLogistic = async (id, logisticData) => {
    try {
        const existing = await findLogisticById(id);
        if (existing.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'Logistic not found'
                }
            };
        }
        if (existing.data.VENDOR_CODE !== logisticData.VENDOR_CODE) {
            const checkDuplicate = await findLogisticByCode(logisticData.VENDOR_CODE);
            if (checkDuplicate.rows > 0) {
                return {
                    status: 409,
                    data: {
                        status: 409,
                        data: null,
                        message: 'Logistic with same vendor code already exists'
                    }
                };
            }
        }
        const result = await updateLogisticById(id, logisticData);
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Logistic updated successfully'
            }
        };
    } catch (error) {
        console.error('Error updating logistic:', error);
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

const deleteLogistic = async (id) => {
    try {
        const existing = await findLogisticById(id);
        if (existing.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'Logistic not found'
                }
            };
        }
        const result = await deleteLogisticById(id);
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Logistic deleted successfully'
            }
        };
    } catch (err) {
        console.error('Error deleting logistic:', err);
        if (err.number === 547) {
            return {
                status: 409,
                data: {
                    status: 409,
                    data: null,
                    message: 'Cannot delete logistic because it is referenced by existing records.'
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
    getAllLogistic,
    getLogisticById,
    createLogistic,
    updateLogistic,
    deleteLogistic
};
