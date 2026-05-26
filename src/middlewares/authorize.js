const {verifyToken} = require('../utils/jwt')
const {getProfile} = require('../api/auth/auth.service');

const authorize = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if(!authHeader) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    console.log(`Auth header: ${authHeader}`);
    const token = authHeader.split(' ')[1];
    // ['Bearer', '123abc.123abc.123abc']
    if(!token) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    
    try {
        const decoded = verifyToken(token);
        console.log(`Decoded token: ${JSON.stringify(decoded)}`);
        const user = await getProfile(decoded.USERNAME);
        if(!user) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        req.user = user;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(401).json({message: 'Unauthorized'});
    }
}

module.exports = authorize;