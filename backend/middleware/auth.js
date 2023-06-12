const jwt = require("jsonwebtoken");

const tokenKey = process.env.TOKEN_KEY ? process.env.TOKEN_KEY : '@Trojahn7686';

function extractToken(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    }
    return false;
}

const verifyToken = (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return res.status(403).json({data: "A token is required for authentication", error: true});
    }
    try {
        const decoded = jwt.verify(token, tokenKey);
        req.user = decoded;
    } catch (err) {
        return res.status(401).json({data: "Invalid Token"});
    }
    return next();
};

module.exports = verifyToken;