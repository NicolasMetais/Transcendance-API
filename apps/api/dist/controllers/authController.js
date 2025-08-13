import { verifyGoogleToken, signToken } from '../jwt.js';
import { createUser } from './usersController.js';
export const googleOAuth = async (db, code) => {
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    const client_url = process.env.GOOGLE_REDIRECT_URL;
    if (!client_id || !client_secret || !client_url) {
        throw new Error('Missing Google OAuth env variables');
    }
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', client_id);
    params.append('client_secret', client_secret);
    params.append('redirect_uri', client_url);
    params.append('grant_type', 'authorization_code');
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
    });
    if (!response.ok)
        throw new Error(`error: ${response.statusText}`);
    const data = await response.json();
    const decoded = await verifyGoogleToken(data.id_token);
    if (!decoded)
        throw new Error('error: Invalid google token bruh');
    var user = await db.get("SELECT id, email FROM users WHERE email = ?", [decoded.email]);
    if (!user)
        user = await createUser(db, decoded.username, decoded.email, '', 0, null, 'placeholder.jpg', 'offline');
    const token = signToken({ userId: user.id });
    return token;
};
