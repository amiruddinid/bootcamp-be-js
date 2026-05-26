const functionGuard = (requiredFunction) => {
    return (req, res, next) => {
        // ternary operator to check if req.user and req.user.data.functions exist
        const userFunctions = req.user && req.user.data.functions ? 
            req.user.data.functions : [];
        
        // ["masterMaterial", "masterUser"]
        
        if(!userFunctions.includes(requiredFunction)) {
            return res.status(403).json({
                message: 'Access denied'
            });
        }
        next();
    }
}
const featureGuard = (requiredFeature) => {
    return (req, res, next) => {
        // ternary operator to check if req.user and req.user.data.functions exist
        const userFunctions = req.user && req.user.data.features ? 
            req.user.data.features : [];
        
        // ["createMaterial", "viewMaterial"]
        
        if(!userFunctions.includes(requiredFeature)) {
            return res.status(403).json({
                message: 'Access denied'
            });
        }
        next();
    }
}

module.exports = {
    functionGuard,
    featureGuard
}