const cron = require('node-cron');
const { poolPromise, sql } = require('../../config/db');

let activeCronJob = null;
let currentCronExpression = '55 15 * * *'; // Default schedule: 15:55 daily

// Function containing the core business logic for the auto-order
async function runAutoOrderJob() {
    console.log('--- AUTO ORDER JOB START ---');
    console.log('Running auto order job at: ' + new Date().toLocaleString());
    
    try {
        const pool = await poolPromise;
        
        // 1. Cek data material di TB_R_INVENTORY dengan menjumlahkan kuantitas per material
        // 2. Bila ada material yang belum tercatat (total quantity = 0), atau
        // 3. Bila ada material yang sudah tercatat tetapi jumlah kurang dari 200,
        // maka buat data order untuk material tersebut di TB_R_ORDER (menggunakan sp amir.usp_CreateOrderMaterial)
        const query = `
            SELECT 
                m.ID as MATERIAL_ID, 
                m.NAME as MATERIAL_NAME,
                m.PART_NUMBER,
                m.SUPPLIER_ID,
                COALESCE(SUM(i.QUANTITY), 0) as TOTAL_QUANTITY
            FROM amir.TB_M_MATERIAL m
            LEFT JOIN amir.TB_R_INVENTORY i ON m.ID = i.MATERIAL_ID
            GROUP BY m.ID, m.NAME, m.PART_NUMBER, m.SUPPLIER_ID
        `;
        
        const result = await pool.request().query(query);
        const materials = result.recordset;
        
        console.log(`Checking ${materials.length} materials for low stock (< 200)...`);
        let orderedCount = 0;
        
        for (const item of materials) {
            if (item.TOTAL_QUANTITY < 200) {
                console.log(`[LOW STOCK] Material: ${item.MATERIAL_NAME} (${item.MATERIAL_ID}) | Current Stock: ${item.TOTAL_QUANTITY} < 200`);
                
                const orderQty = 500; // Default order quantity
                
                try {
                    // Call stored procedure amir.usp_CreateOrderMaterial
                    await pool.request()
                        .input('Input_ID_Material', sql.NVarChar(50), item.MATERIAL_ID)
                        .input('Input_Qty_Order', sql.Decimal(18, 0), orderQty)
                        .input('Input_User', sql.NVarChar(255), 'SYSTEM_JOB')
                        .execute('amir.usp_CreateOrderMaterial');
                    
                    orderedCount++;
                    console.log(`[ORDER CREATED] Ordered ${orderQty} units for ${item.MATERIAL_NAME}`);
                } catch (procErr) {
                    console.error(`[ORDER FAILED] Failed to order ${item.MATERIAL_ID}:`, procErr.message);
                }
            }
        }
        
        console.log(`--- AUTO ORDER JOB COMPLETED. Materials ordered: ${orderedCount} ---`);
        return { success: true, orderedCount };
    } catch (err) {
        console.error('[JOB ERROR] Error running auto order job:', err);
        return { success: false, error: err.message };
    }
}

// Dynamically schedule or reschedule the cron job
function scheduleJob(cronExpr) {
    if (activeCronJob) {
        console.log(`Stopping existing auto-order job scheduled at: ${currentCronExpression}`);
        activeCronJob.stop();
    }
    
    currentCronExpression = cronExpr;
    console.log(`Starting auto-order job with schedule: ${currentCronExpression}`);
    
    activeCronJob = cron.schedule(currentCronExpression, async () => {
        await runAutoOrderJob();
    });
    activeCronJob.start();
}

// Read the schedule from the database and initialize the job
async function startAutoOrderJobManager() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT CRON_EXPRESSION 
            FROM amir.TB_M_JOB_CONFIG 
            WHERE JOB_NAME = 'auto_order_inventory'
        `);
        
        let dbCronExpr = '55 15 * * *';
        if (result.recordset.length > 0) {
            dbCronExpr = result.recordset[0].CRON_EXPRESSION;
        }
        
        scheduleJob(dbCronExpr);
    } catch (err) {
        console.error('Failed to load auto-order schedule from DB, using default:', err);
        scheduleJob('55 15 * * *');
    }
}

// Function to update the running job schedule on the fly
function updateJobSchedule(newCronExpr) {
    console.log(`Request to update auto-order job schedule to: ${newCronExpr}`);
    scheduleJob(newCronExpr);
}

// Backwards-compatible exports matching be/index.js structure
const autoOrderJob = {
    start: () => {
        startAutoOrderJobManager();
    }
};

const autoOrderJob2 = {
    start: () => {
        console.log('autoOrderJob2 dummy started');
    }
};

module.exports = {
    autoOrderJob,
    autoOrderJob2,
    runAutoOrderJob, // Exported to allow manual trigger from API
    updateJobSchedule // Exported to allow dynamic rescheduling from API
};