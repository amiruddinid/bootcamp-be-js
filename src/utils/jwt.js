const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
    return jwt.sign(payload, 
        'SuperSecret1337', 
        { expiresIn: '1h' }
    );
}

const verifyToken = (token) => {
    try {
        return jwt.verify(token, 
            'SuperSecret1337');
    } catch (err) {
        throw new Error('Invalid token');
    }
}

module.exports = {
    generateToken,
    verifyToken
}