const { poolPromise, sql } = require('../../../config/db');

const findJobConfig = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query(`
        SELECT JOB_NAME, CRON_EXPRESSION, IS_ACTIVE, CHANGED_DT, CHANGED_BY 
        FROM amir.TB_M_JOB_CONFIG 
        WHERE JOB_NAME = 'auto_order_inventory'
    `);
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const updateJobConfig = async (cronExpression, username) => {
    const pool = await poolPromise;
    const request = pool.request();
    
    const result = await request.query`
        UPDATE amir.TB_M_JOB_CONFIG 
        SET CRON_EXPRESSION = ${cronExpression}, 
            CHANGED_DT = GETDATE(), 
            CHANGED_BY = ${username} 
        WHERE JOB_NAME = 'auto_order_inventory';
        
        SELECT JOB_NAME, CRON_EXPRESSION, IS_ACTIVE, CHANGED_DT, CHANGED_BY 
        FROM amir.TB_M_JOB_CONFIG 
        WHERE JOB_NAME = 'auto_order_inventory';
    `;
    
    return {
        data: result.recordset[0],
        rows: result.rowsAffected[0]
    };
};

const getMaterialInventoryStatus = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query(`
        SELECT 
            m.ID, 
            m.PART_NUMBER, 
            m.NAME, 
            m.CATEGORY, 
            m.UNIT, 
            COALESCE(SUM(i.QUANTITY), 0) as TOTAL_STOCK,
            CASE WHEN COALESCE(SUM(i.QUANTITY), 0) < 200 THEN 1 ELSE 0 END as IS_LOW_STOCK
        FROM amir.TB_M_MATERIAL m
        LEFT JOIN amir.TB_R_INVENTORY i ON m.ID = i.MATERIAL_ID
        GROUP BY m.ID, m.PART_NUMBER, m.NAME, m.CATEGORY, m.UNIT
        ORDER BY TOTAL_STOCK ASC, m.NAME ASC
    `);
    
    return {
        data: result.recordset,
        rows: result.rowsAffected[0]
    };
};

module.exports = {
    findJobConfig,
    updateJobConfig,
    getMaterialInventoryStatus
};
