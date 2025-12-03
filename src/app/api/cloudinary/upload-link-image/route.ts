import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {

  const cookieStore = await cookies();
  try {
    requireAuth(cookieStore);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { file } = await req.json();

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    const uploadResult = await cloudinary.uploader.upload(file, {
      folder: "link_images",
      transformation: [
        { width: 1080, height: 1080, crop: "limit", quality: "auto" },
      ],
      resource_type: "image",
    });

    return NextResponse.json({
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cloudinary upload error";
    console.error("Cloudinary upload error:", err);
    return NextResponse.json(
      { error: message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
