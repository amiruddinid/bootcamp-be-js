const { findAllMaterial, findMaterialById, 
    findMaterialByPartNumber, insertMaterial, 
    updateMaterialById, deleteMaterialById } = require('./material.repository');

const getAllMaterial = async () => {
    try {
        const getAllMaterialResult = await findAllMaterial(); // panggil fungsi untuk mengambil semua material dari database
        
        return {
            status: 200,
            data: {
                status: 200,
                message: 'Materials retrieved successfully',
                data: getAllMaterialResult.data,
                metadata: {
                    total: getAllMaterialResult.rows
                }
            },
        };
    } catch (error) {
        console.error('Error retrieving materials:', error);
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

const getMaterialById = async (id) => {
    try {
        const getMaterialByIdResult = await findMaterialById(id); // panggil fungsi untuk mengambil material berdasarkan ID dari database
        if(getMaterialByIdResult.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    message: 'Material not found',
                    data: null
                },
            };
        }
        return {
            status: 200,
            data: {
                status: 200,
                data: getMaterialByIdResult.data,
                message: 'Material retrieved successfully'
            },
        };
    } catch (error) {
        console.error('Error retrieving material:', error);
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

const createMaterial = async (materialData) => {
    try {
        const body = materialData; // ambil data dari parameter
        const getMaterialByPartNumber = await findMaterialByPartNumber(body.PART_NUMBER); // panggil fungsi untuk mengambil material berdasarkan PART_NUMBER dari database
        if(getMaterialByPartNumber.rows > 0) {
            return {
                status: 409,
                data: {
                    status: 409,
                    data: null,
                    message: 'Material with same part number already exists'
                },
            };
        }
        const result = await insertMaterial(body); // panggil fungsi untuk memasukkan data material ke database
        return {
            status: 201,
            data: {
                status: 201,
                data: result.data,
                message: 'Material created successfully'
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

const updateMaterial = async (id, materialData) => {
    try {
        const body = materialData; // ambil data dari parameter
        const getMaterialByIdResult = await findMaterialById(id); // panggil fungsi untuk mengambil material berdasarkan ID dari database
        if(getMaterialByIdResult.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'Material not found'
                }
            };
        }
        if(getMaterialByIdResult.data.PART_NUMBER !== body.PART_NUMBER) { // cek jika PART_NUMBER di request body berbeda dengan PART_NUMBER di database
            const getMaterialByPartNumber = await findMaterialByPartNumber(body.PART_NUMBER); // panggil fungsi untuk mengambil material berdasarkan PART_NUMBER dari database
            if(getMaterialByPartNumber.rows > 0) {
                return {
                    status: 409,
                    data: {
                        status: 409,
                        data: null,
                        message: 'Material with same part number already exists'
                    }
                };
            }
        }
        const result = await updateMaterialById(id, body); // panggil fungsi untuk mengupdate data material di database
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Data material berhasil diupdate'
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

const deleteMaterial = async (id) => {
    try {
        const getMaterialByIdResult = await findMaterialById(id); // panggil fungsi untuk mengambil material berdasarkan ID dari database
        if(getMaterialByIdResult.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'Material not found'
                }
            };
        }
        const result = await deleteMaterialById(id); // panggil fungsi untuk menghapus data material di database
        return {
            status: 200,
            data: {
                status: 200,
                data: result.data,
                message: 'Data material berhasil dihapus'
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
    getAllMaterial,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial
}