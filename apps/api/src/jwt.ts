import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in env');
}

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '24h'});
}

export function verifyToken(token: string): JwtPayload | string | null {
	try {
    	return jwt.verify(token, JWT_SECRET as string);
	} catch (err: any) {
		if (err.name === 'TokenExpiredError') {
			return null;
		}
		throw err;
	}
}
