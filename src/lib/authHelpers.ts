import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/tokens";
import { User, IUser } from "@/models/User";
import { findRefreshToken, replaceRefreshToken } from "@/lib/tokenUtils";

interface RefreshResult {
  success: boolean;
  user?: IUser | null;
  newAccessToken?: string;
  newRefreshToken?: string;
  error?: string;
}

export async function validateAndRefreshTokens(refreshToken: string): Promise<RefreshResult> {
  console.log("\n--- REFRESH START ---");
  console.log("Incoming refresh token (trimmed):", refreshToken?.slice(0, 12));

  try {
    const payload = verifyRefreshToken(refreshToken) as {
      userId: string;
      username: string;
    };

    console.log("Decoded refresh token payload:", payload);

    const user = await User.findById(payload.userId).select("-password -__v");

    console.log("User found:", !!user);

    if (!user) {
      console.log("❌ User not found in DB");
      return { success: false, error: "User not found" };
    }

    const tokenData = await findRefreshToken(user._id.toString(), refreshToken);
    if (!tokenData) {
      console.log("❌ Refresh token mismatch!");
      return { success: false, error: "Invalid refresh token" };
    }

    console.log("Stored DB refresh token found for device:", tokenData.deviceId);

    const newAccessToken = signAccessToken({
      userId: user._id.toString(),
      username: user.username,
    });

    const newRefreshToken = signRefreshToken({
      userId: user._id.toString(),
      username: user.username,
    });

    console.log("New access token generated");
    console.log("New refresh token generated (trimmed):", newRefreshToken.slice(0, 12));

    await replaceRefreshToken(
      user._id.toString(),
      refreshToken,
      newRefreshToken,
      tokenData.deviceId
    );

    console.log("Refresh token UPDATED in DB");
    console.log("--- REFRESH SUCCESS ---\n");

    return {
      success: true,
      user,
      newAccessToken,
      newRefreshToken,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Session expired or invalid. Signed out.";
    console.error("\n--- REFRESH ERROR ---");
    console.error("Error during refreshing:", message || err);
    console.error("--- REFRESH FAIL ---\n");

    return { success: false, error: "Session expired or invalid. Signed out." };
  }
}
