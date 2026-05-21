const AppError = require('../utils/AppError'); 
const errorHandller = require('./errorHandler');

const validateInput = (schema) => (req, res, next) => {
    // Lakukan validasi menggunakan schema yang diberikan
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params
    });

    // Jika validasi gagal, buat error baru dengan pesan yang sesuai dan status code 400
    if (!result.success) {
        const messages = result.error.issues.map(e => e.message).join(', ');
        return errorHandller(new AppError(messages, 400), req, res, next);
    }

    // Jika validasi berhasil, update req dengan data yang sudah di-parse
    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;

    next(); // lanjut ke middleware berikutnya

};

module.exports = validateInput;