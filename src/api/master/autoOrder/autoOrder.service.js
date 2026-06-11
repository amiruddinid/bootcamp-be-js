const { findJobConfig, updateJobConfig, getMaterialInventoryStatus } = require('./autoOrder.repository');
const { updateJobSchedule, runAutoOrderJob } = require('../../../jobs/orderMaterial/autoOrderJob');

// Helper to convert cron 'MM HH * * *' to 'HH:MM'
function cronToTime(cronExpr) {
    if (!cronExpr) return '15:55';
    const parts = cronExpr.trim().split(/\s+/);
    if (parts.length >= 2) {
        const minute = parts[0].padStart(2, '0');
        const hour = parts[1].padStart(2, '0');
        return `${hour}:${minute}`;
    }
    return '15:55';
}

// Helper to convert 'HH:MM' to cron 'MM HH * * *'
function timeToCron(timeStr) {
    const [hourStr, minuteStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    return `${minute} ${hour} * * *`;
}

const getJobConfigService = async () => {
    try {
        const result = await findJobConfig();
        if (result.rows === 0) {
            return {
                status: 200,
                data: {
                    jobName: 'auto_order_inventory',
                    scheduleTime: '15:55',
                    isActive: true
                }
            };
        }
        
        const config = result.data;
        return {
            status: 200,
            data: {
                jobName: config.JOB_NAME,
                scheduleTime: cronToTime(config.CRON_EXPRESSION),
                isActive: config.IS_ACTIVE === true || config.IS_ACTIVE === 1,
                changedDt: config.CHANGED_DT,
                changedBy: config.CHANGED_BY
            }
        };
    } catch (err) {
        console.error('Error in getJobConfigService:', err);
        return { status: 500, data: { message: 'Internal server error: ' + err.message } };
    }
};

const updateJobConfigService = async (scheduleTime, username) => {
    try {
        const cronExpression = timeToCron(scheduleTime);
        
        // 1. Update in database
        const result = await updateJobConfig(cronExpression, username);
        if (result.rows === 0) {
            return { status: 400, data: { message: 'Failed to update job configuration' } };
        }
        
        // 2. Reschedule the active node-cron job immediately
        updateJobSchedule(cronExpression);
        
        const updatedConfig = result.data;
        return {
            status: 200,
            data: {
                jobName: updatedConfig.JOB_NAME,
                scheduleTime: cronToTime(updatedConfig.CRON_EXPRESSION),
                isActive: updatedConfig.IS_ACTIVE === true || updatedConfig.IS_ACTIVE === 1,
                changedDt: updatedConfig.CHANGED_DT,
                changedBy: updatedConfig.CHANGED_BY
            },
            message: 'Job schedule updated and rescheduled successfully'
        };
    } catch (err) {
        console.error('Error in updateJobConfigService:', err);
        return { status: 500, data: { message: 'Internal server error: ' + err.message } };
    }
};

const triggerJobService = async () => {
    try {
        // Trigger the job immediately
        const runResult = await runAutoOrderJob();
        if (runResult.success) {
            return {
                status: 200,
                data: {
                    orderedCount: runResult.orderedCount
                },
                message: `Job completed successfully. Ordered ${runResult.orderedCount} items.`
            };
        } else {
            return {
                status: 500,
                data: { message: 'Job failed: ' + runResult.error }
            };
        }
    } catch (err) {
        console.error('Error in triggerJobService:', err);
        return { status: 500, data: { message: 'Internal server error: ' + err.message } };
    }
};

const getInventoryStatusService = async () => {
    try {
        const result = await getMaterialInventoryStatus();
        return {
            status: 200,
            data: result.data.map(item => ({
                id: item.ID,
                partNumber: item.PART_NUMBER,
                name: item.NAME,
                category: item.CATEGORY,
                unit: item.UNIT,
                totalStock: item.TOTAL_STOCK,
                isLowStock: item.IS_LOW_STOCK === 1
            }))
        };
    } catch (err) {
        console.error('Error in getInventoryStatusService:', err);
        return { status: 500, data: { message: 'Internal server error: ' + err.message } };
    }
};

module.exports = {
    getJobConfigService,
    updateJobConfigService,
    triggerJobService,
    getInventoryStatusService
};
