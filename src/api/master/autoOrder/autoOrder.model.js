const z = require('zod');

const updateConfigSchema = z.object({
    scheduleTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format (e.g., 15:55 or 09:30)')
});

const postUpdateConfigSchema = z.object({
    body: updateConfigSchema
});

module.exports = {
    postUpdateConfigSchema
};
