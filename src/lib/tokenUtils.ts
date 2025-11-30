import { User, RefreshToken } from "@/models/User";

/**
 * Generate a unique device ID based on user agent and timestamp
 */
export function generateDeviceId(userAgent?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const uaHash = userAgent 
        ? Buffer.from(userAgent).toString('base64').substring(0, 10)
        : 'unknown';
    return `${uaHash}-${timestamp}-${random}`;
}

/**
 * Add a new refresh token to user's token array
 */
export async function addRefreshToken(
    userId: string,
    token: string,
    deviceId: string
): Promise<void> {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Initialize array if it doesn't exist
    if (!user.refreshTokens) {
        user.refreshTokens = [];
    }

    // Add new token
    user.refreshTokens.push({
        token,
        deviceId,
        createdAt: new Date(),
    });

    // Keep only last 10 tokens per user (prevent unlimited growth)
    if (user.refreshTokens.length > 10) {
        user.refreshTokens = user.refreshTokens
            .sort((a: RefreshToken, b: RefreshToken) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 10);
    }

    await user.save();
}

/**
 * Find a refresh token in user's token array
 */
export async function findRefreshToken(
    userId: string,
    token: string
): Promise<RefreshToken | null> {
    const user = await User.findById(userId);
    if (!user) return null;

    // Check new array format
    if (user.refreshTokens && user.refreshTokens.length > 0) {
        const found = user.refreshTokens.find((rt: RefreshToken) => rt.token === token);
        if (found) return found;
    }

    // Backward compatibility: check legacy single token field
    if (user.refreshToken === token) {
        return {
            token: user.refreshToken,
            deviceId: 'legacy-device',
            createdAt: user.updatedAt || user.createdAt,
        };
    }

    return null;
}

/**
 * Remove a refresh token from user's token array
 */
export async function removeRefreshToken(
    userId: string,
    token: string
): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user) return false;

    let removed = false;

    // Remove from new array format
    if (user.refreshTokens && user.refreshTokens.length > 0) {
        const initialLength = user.refreshTokens.length;
        user.refreshTokens = user.refreshTokens.filter((rt: RefreshToken) => rt.token !== token);
        removed = user.refreshTokens.length < initialLength;
    }

    // Backward compatibility: clear legacy single token if it matches
    if (user.refreshToken === token) {
        user.refreshToken = undefined;
        removed = true;
    }

    if (removed) {
        await user.save();
    }

    return removed;
}

/**
 * Remove all refresh tokens for a user (logout from all devices)
 */
export async function removeAllRefreshTokens(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;

    user.refreshTokens = [];
    user.refreshToken = undefined; // Clear legacy field too
    await user.save();
}

/**
 * Replace a refresh token (used during token rotation)
 */
export async function replaceRefreshToken(
    userId: string,
    oldToken: string,
    newToken: string,
    deviceId: string
): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user) return false;

    let replaced = false;

    // Replace in new array format
    if (user.refreshTokens && user.refreshTokens.length > 0) {
        const tokenIndex = user.refreshTokens.findIndex((rt: RefreshToken) => rt.token === oldToken);
        if (tokenIndex !== -1) {
            user.refreshTokens[tokenIndex] = {
                token: newToken,
                deviceId,
                createdAt: new Date(),
            };
            replaced = true;
        }
    }

    // Backward compatibility: replace legacy single token
    if (user.refreshToken === oldToken) {
        user.refreshToken = newToken;
        replaced = true;
    }

    if (replaced) {
        await user.save();
    }

    return replaced;
}

/**
 * Clean up expired refresh tokens (older than 7 days)
 */
export async function cleanupExpiredTokens(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user || !user.refreshTokens) return;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    user.refreshTokens = user.refreshTokens.filter(
        (rt: RefreshToken) => rt.createdAt > sevenDaysAgo
    );

    await user.save();
}

