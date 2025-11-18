import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const { file } = await req.json();

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    const uploadResult = await cloudinary.uploader.upload(file, {
      folder: "user_avatars",
      transformation: [{ width: 512, height: 512, crop: "limit" }],
    });

    return NextResponse.json({
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cloudinary upload error";
    return NextResponse.json(
      { error: message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
