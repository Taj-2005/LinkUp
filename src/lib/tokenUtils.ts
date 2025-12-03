import { User, RefreshToken } from "@/models/User";

export function generateDeviceId(userAgent?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const uaHash = userAgent
        ? Buffer.from(userAgent).toString('base64').substring(0, 10)
        : 'unknown';
    return `${uaHash}-${timestamp}-${random}`;
}

export async function addRefreshToken(
    userId: string,
    token: string,
    deviceId: string
): Promise<void> {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (!user.refreshTokens) {
        user.refreshTokens = [];
    }

    user.refreshTokens.push({
        token,
        deviceId,
        createdAt: new Date(),
    });

    if (user.refreshTokens.length > 10) {
        user.refreshTokens = user.refreshTokens
            .sort((a: RefreshToken, b: RefreshToken) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 10);
    }

    await user.save();
}

export async function findRefreshToken(
    userId: string,
    token: string
): Promise<RefreshToken | null> {
    const user = await User.findById(userId);
    if (!user) return null;

    if (user.refreshTokens && user.refreshTokens.length > 0) {
        const found = user.refreshTokens.find((rt: RefreshToken) => rt.token === token);
        if (found) return found;
    }

    if (user.refreshToken === token) {
        return {
            token: user.refreshToken,
            deviceId: 'legacy-device',
            createdAt: user.updatedAt || user.createdAt,
        };
    }

    return null;
}

export async function removeRefreshToken(
    userId: string,
    token: string
): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user) return false;

    let removed = false;

    if (user.refreshTokens && user.refreshTokens.length > 0) {
        const initialLength = user.refreshTokens.length;
        user.refreshTokens = user.refreshTokens.filter((rt: RefreshToken) => rt.token !== token);
        removed = user.refreshTokens.length < initialLength;
    }

    if (user.refreshToken === token) {
        user.refreshToken = undefined;
        removed = true;
    }

    if (removed) {
        await user.save();
    }

    return removed;
}

export async function removeAllRefreshTokens(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;

    user.refreshTokens = [];
    user.refreshToken = undefined;
    await user.save();
}

export async function replaceRefreshToken(
    userId: string,
    oldToken: string,
    newToken: string,
    deviceId: string
): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user) return false;

    let replaced = false;

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

    if (user.refreshToken === oldToken) {
        user.refreshToken = newToken;
        replaced = true;
    }

    if (replaced) {
        await user.save();
    }

    return replaced;
}

export async function cleanupExpiredTokens(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user || !user.refreshTokens) return;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    user.refreshTokens = user.refreshTokens.filter(
        (rt: RefreshToken) => rt.createdAt > sevenDaysAgo
    );

    await user.save();
}
