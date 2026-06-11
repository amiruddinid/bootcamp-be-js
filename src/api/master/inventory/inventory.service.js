const { findAllInventory, findAllReceipts, approveReceipt } = require('./inventory.repository');

const getInventoryList = async () => {
    try {
        const result = await findAllInventory();
        return {
            status: 200,
            data: result.data
        };
    } catch (err) {
        console.error('Error in getInventoryList:', err);
        return { 
            status: 500, 
            data: { message: 'Internal server error: ' + err.message } 
        };
    }
};

const getReceiptList = async () => {
    try {
        const result = await findAllReceipts();
        return {
            status: 200,
            data: result.data
        };
    } catch (err) {
        console.error('Error in getReceiptList:', err);
        return {
            status: 500,
            data: { message: 'Internal server error: ' + err.message }
        };
    }
};

const approveReceiptService = async (orderId, username) => {
    try {
        const result = await approveReceipt(orderId, username);
        return {
            status: 200,
            data: result,
            message: 'Order approved and inventory restocked successfully'
        };
    } catch (err) {
        console.error('Error in approveReceiptService:', err);
        return {
            status: 500,
            data: { message: 'Internal server error: ' + err.message }
        };
    }
};

module.exports = {
    getInventoryList,
    getReceiptList,
    approveReceiptService
};
