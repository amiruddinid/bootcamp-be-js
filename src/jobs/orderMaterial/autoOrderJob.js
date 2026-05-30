const cron = require('node-cron');
const { poolPromise } = require('../../config/db');

const autoOrderJob = cron.schedule('55 15 * * *', 
    async() => {
    // Proses order :
    // 1. Cek data material di TB_R_INVENTORY
    // 2. Bila ada material yang belum tercatat di TB_R_INVENTORY, 
    // maka buat data order untuk material tersebut di TB_R_ORDER
    // 3. Bila ada material yang sudah tercatat di TB_R_INVENTORY,
    // maka cek jumlah material tersebut di TB_R_INVENTORY, 
    // bila jumlah material kurang dari 200, 
    // maka buat data order untuk material tersebut di TB_R_ORDER
    console.log('Running auto order job...');
    console.log('Job berjalan pada ' + 
        new Date().toLocaleString());
});

const autoOrderJob2 = cron.schedule('55 15 * * *', 
    async() => {
    // Proses order :
    // 1. Cek data material di TB_R_INVENTORY
    // 2. Bila ada material yang belum tercatat di TB_R_INVENTORY, 
    // maka buat data order untuk material tersebut di TB_R_ORDER
    // 3. Bila ada material yang sudah tercatat di TB_R_INVENTORY,
    // maka cek jumlah material tersebut di TB_R_INVENTORY, 
    // bila jumlah material kurang dari 200, 
    // maka buat data order untuk material tersebut di TB_R_ORDER
    console.log('Running auto order job 2...');
    console.log('Job berjalan pada ' + 
        new Date().toLocaleString());
});

module.exports = {
    autoOrderJob,
    autoOrderJob2
};