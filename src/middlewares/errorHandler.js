const errorHandller = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: err.statusCode,
        message: err.message || "Internal Server Error"
    });
};

module.exports = errorHandller;