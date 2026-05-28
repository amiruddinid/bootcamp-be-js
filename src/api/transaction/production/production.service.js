const { 
    findAllProduction, 
    findProductionById, 
    findProductionMaterialsByProductionId, 
    findProductionLogsByProductionId, 
    createProductionOrderTransaction, 
    updateProductionStatus 
} = require('./production.repository');

// Service untuk mengambil seluruh daftar perintah produksi
const getAllProduction = async () => {
    try {
        const result = await findAllProduction();
        return {
            status: 200,
            data: {
                status: 200,
                message: 'Production orders retrieved successfully',
                data: result.data,
                metadata: {
                    total: result.rows
                }
            }
        };
    } catch (error) {
        console.error('Error retrieving production orders:', error);
        return {
            status: 500,
            data: {
                status: 500,
                data: null,
                message: 'Internal Server Error'
            }
        };
    }
};

// Service untuk mengambil detail lengkap perintah produksi (termasuk material dikonsumsi dan histori status)
const getProductionById = async (id) => {
    try {
        // 1. Cari data header perintah produksi
        const productionResult = await findProductionById(id);
        if (productionResult.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    message: 'Production order not found',
                    data: null
                }
            };
        }

        // 2. Ambil detail bahan baku yang digunakan dalam produksi ini
        const materialsResult = await findProductionMaterialsByProductionId(id);
        // 3. Ambil log mutasi status (audit trail) untuk produksi ini
        const logsResult = await findProductionLogsByProductionId(id);

        // Gabungkan seluruh data menjadi satu response object yang komprehensif
        const responseData = {
            ...productionResult.data,
            MATERIALS_CONSUMED: materialsResult.data,
            STATUS_LOGS: logsResult.data
        };

        return {
            status: 200,
            data: {
                status: 200,
                message: 'Production order retrieved successfully',
                data: responseData
            }
        };
    } catch (error) {
        console.error('Error retrieving production order details:', error);
        return {
            status: 500,
            data: {
                status: 500,
                data: null,
                message: 'Internal Server Error'
            }
        };
    }
};

// Service untuk memproses pembuatan transaksi produksi baru
const createProduction = async (productionData) => {
    try {
        // Panggil fungsi repository untuk eksekusi stored procedure transaksi
        const result = await createProductionOrderTransaction(productionData);
        return {
            status: 201,
            data: {
                status: 201,
                data: result.data,
                message: 'Production order created successfully and inventory consumed'
            }
        };
    } catch (error) {
        console.error('Error creating production order:', error);
        
        // Memetakan THROW error kustom dari Database (stored procedure) ke HTTP status 400 Bad Request
        // Error number dari database kustom berkisar antara 50000 - 50010
        if (error.number >= 50000 && error.number <= 50010) {
            return {
                status: 400,
                data: {
                    status: 400,
                    data: null,
                    message: error.message // Berisi pesan kegagalan (stok kurang, VIN terduplikasi, dsb)
                }
            };
        }

        return {
            status: 500,
            data: {
                status: 500,
                data: null,
                message: 'Internal Server Error'
            }
        };
    }
};

// Service untuk memperbarui status transaksi produksi
const updateProduction = async (id, statusData) => {
    try {
        // 1. Periksa eksistensi perintah produksi
        const existing = await findProductionById(id);
        if (existing.rows === 0) {
            return {
                status: 404,
                data: {
                    status: 404,
                    data: null,
                    message: 'Production order not found'
                }
            };
        }

        // 2. Validasi: Jangan update status jika status baru sama dengan status lama
        if (existing.data.STATUS === statusData.STATUS) {
            return {
                status: 400,
                data: {
                    status: 400,
                    data: null,
                    message: `Production order status is already "${statusData.STATUS}"`
                }
            };
        }

        // 3. Validasi aturan bisnis: Produksi yang telah selesai (Completed) atau batal (Cancelled) tidak boleh diubah statusnya lagi
        if (existing.data.STATUS === 'Completed' || existing.data.STATUS === 'Cancelled') {
            return {
                status: 400,
                data: {
                    status: 400,
                    data: null,
                    message: `Cannot update status of a "${existing.data.STATUS}" production order`
                }
            };
        }

        // 4. Eksekusi perubahan status dan pencatatan log histori
        await updateProductionStatus(id, {
            ...statusData,
            PREVIOUS_STATUS: existing.data.STATUS
        });

        // Ambil data terbaru setelah berhasil diperbarui untuk dikembalikan ke client
        const updated = await findProductionById(id);

        return {
            status: 200,
            data: {
                status: 200,
                data: updated.data,
                message: 'Production order status updated successfully'
            }
        };
    } catch (error) {
        console.error('Error updating production status:', error);
        return {
            status: 500,
            data: {
                status: 500,
                data: null,
                message: 'Internal Server Error'
            }
        };
    }
};

module.exports = {
    getAllProduction,
    getProductionById,
    createProduction,
    updateProduction
};
