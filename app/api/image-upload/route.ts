
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  public_id: string;
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
}

interface CloudinaryErrorResponse {
  error?: {
    message?: string;
  };
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  let uploadedPublicId: string | null = null;

  try {
   
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // 2. Verify Cloudinary credentials
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary credentials are not configured." },
        { status: 500 }
      );
    }

    // 3. Read and validate form data
    const formData = await request.formData();
    const file = formData.get("file");
    const titleValue = formData.get("title");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "A valid image file is required." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Please upload a valid image file." },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image size must not exceed 10 MB." },
        { status: 413 }
      );
    }

    const title =
      typeof titleValue === "string" && titleValue.trim()
        ? titleValue.trim().slice(0, 120)
        : null;

    // 4. Convert image to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 5. Upload directly to Cloudinary
    const cloudinaryForm = new FormData();

    cloudinaryForm.append(
      "file",
      new Blob([new Uint8Array(buffer)], { type: file.type }),
      file.name
    );

    cloudinaryForm.append("folder", "next-cloudinary-uploads");

    const authorization = Buffer.from(
      `${apiKey}:${apiSecret}`
    ).toString("base64");

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authorization}`,
        },
        body: cloudinaryForm,
        cache: "no-store",
      }
    );

    const responseBody =
      (await cloudinaryResponse.json().catch(() => null)) as
        | CloudinaryUploadResult & CloudinaryErrorResponse
        | null;

    if (!cloudinaryResponse.ok || !responseBody?.public_id) {
      throw new Error(
        responseBody?.error?.message ||
          `Cloudinary upload failed (${cloudinaryResponse.status}).`
      );
    }

    const result = responseBody as CloudinaryUploadResult;
    uploadedPublicId = result.public_id;

    // 6. Save image metadata in PostgreSQL
    const image = await prisma.image.create({
      data: {
        userId,
        title,
        publicId: result.public_id,
        format: result.format ?? null,
        size: result.bytes,
        width: result.width ?? null,
        height: result.height ?? null,
      },
    });

    // 7. Create notification if enabled in user preferences
    try {
      const preferences = await prisma.userPreference.findUnique({
        where: { userId },
        select: {
          uploadNotifications: true,
        },
      });

      // Notifications are enabled by default for users without preferences.
      if (preferences?.uploadNotifications !== false) {
        await prisma.notification.create({
          data: {
            userId,
            type: "upload",
            title: "Image uploaded successfully",
            message: `"${title || file.name}" has been uploaded to your media library.`,
            href: "/home/media?type=image",
          },
        });
      }
    } catch (notificationError) {
      // Notification failure should not affect a successful upload.
      console.error(
        "Image upload notification failed:",
        notificationError
      );
    }

    return NextResponse.json(
      {
        message: "Image uploaded successfully.",
        image,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Image upload failed:", error);

    // 8. Clean up Cloudinary asset if database saving failed
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId, {
          resource_type: "image",
        });
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError);
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Image upload failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
