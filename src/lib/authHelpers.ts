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
  console.log("\n--- REFRESH START ---");
  console.log("Incoming refresh token (trimmed):", refreshToken?.slice(0, 12));

  try {
    // 🔥 SAFELY VERIFY REFRESH TOKEN (this throws if expired/invalid)
    const payload = verifyRefreshToken(refreshToken) as {
      userId: string;
      username: string;
    };

    console.log("Decoded refresh token payload:", payload);

    // 🔥 Fetch the user
    const user = await User.findById(payload.userId).select("-password -__v");

    console.log("User found:", !!user);

    if (!user) {
      console.log("❌ User not found in DB");
      return { success: false, error: "User not found" };
    }

    // 🔥 Check if refreshToken in DB matches cookie token
    console.log("Stored DB refresh token begins:", user.refreshToken?.slice(0, 12));
    if (!user.refreshToken || user.refreshToken !== refreshToken) {
      console.log("❌ Refresh token mismatch!");
      return { success: false, error: "Invalid refresh token" };
    }

    // -------------------------------
    //  🔥 Rotate Tokens
    // -------------------------------

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

    // 🔥 SAVE new refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();

    console.log("Refresh token UPDATED in DB");
    console.log("--- REFRESH SUCCESS ---\n");

    return {
      success: true,
      user,
      newAccessToken,
      newRefreshToken,
    };
  } catch (err: any) {
    console.error("\n--- REFRESH ERROR ---");
    console.error("Error during refreshing:", err?.message || err);
    console.error("--- REFRESH FAIL ---\n");

    return { success: false, error: "Session expired or invalid. Signed out." };
  }
}
