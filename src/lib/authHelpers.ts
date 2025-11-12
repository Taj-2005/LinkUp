import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/tokens";
import { User, IUser } from "@/models/User";

interface RefreshResult {
  success: boolean;
  user?: IUser | null;
  newAccessToken?: string;
  newRefreshToken?: string;
  error?: string;
}

export async function validateAndRefreshTokens(refreshToken: string): Promise<RefreshResult> {
  try {
    const payload = verifyRefreshToken(refreshToken) as {
      userId: string;
      username: string;
    };

    const user = await User.findById(payload.userId).select("-password -__v");
    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.refreshToken !== refreshToken) {
      return { success: false, error: "Invalid refresh token" };
    }

    const newAccessToken = signAccessToken({
      userId: user._id,
      username: user.username,
    });

    const newRefreshToken = signRefreshToken({
      userId: user._id,
      username: user.username,
    });

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      success: true,
      user,
      newAccessToken,
      newRefreshToken,
    };
  } catch {
    return { success: false, error: "Session expired or invalid. Signed out." };
  }
}
