import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
const client = jwksClient({
    jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 10 * 60 * 1000 // 10min
});
function getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
        if (err) {
            return callback(err);
        }
        if (!key)
            return callback(new Error('No key found'));
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}
export function verifyGoogleToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {
            audience: process.env.GOOGLE_CLIENT_ID,
            issuer: ['https://accounts.google.com', 'accounts.google.com']
        }, (err, decoded) => {
            if (err)
                return resolve(null);
            else
                return resolve(decoded);
        });
    });
}
;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in env');
}
export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
export function verifyToken(token) {
    if (!token)
        return null;
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            return null;
        }
        throw err;
    }
}
