import jwt from 'jsonwebtoken';

export interface TokenPayload {
    userId: string;
    email: string;
    username: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
        throw new Error('ACCESS_TOKEN_SECRET is not defined');
    }
    
    // Convert to number of seconds if needed, or use string directly
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRY || '24h'; // Using hours instead of days
    
    return jwt.sign(payload, secret, { expiresIn } as any);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
        throw new Error('REFRESH_TOKEN_SECRET is not defined');
    }
    
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRY || '216h'; // 9 days in hours
    
    return jwt.sign(payload, secret, { expiresIn } as any);
};

export const verifyAccessToken = (token: string): TokenPayload => {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
        throw new Error('ACCESS_TOKEN_SECRET is not defined');
    }
    
    return jwt.verify(token, secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
        throw new Error('REFRESH_TOKEN_SECRET is not defined');
    }
    
    return jwt.verify(token, secret) as TokenPayload;
};