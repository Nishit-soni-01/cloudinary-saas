
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
  bytes: number;
  duration?: number;
}

interface CloudinaryErrorResponse {
  error?: {
    message?: string;
  };
}

const MAX_VIDEO_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  let uploadedPublicId: string | null = null;

  try {
    // 1. Authenticate user
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
    const title = formData.get("title");
    const description = formData.get("description");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "A valid video file is required." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Please upload a valid video file." },
        { status: 400 }
      );
    }

    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "Video size must not exceed 10 MB." },
        { status: 413 }
      );
    }

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Video title is required." },
        { status: 400 }
      );
    }

    const videoTitle = title.trim().slice(0, 120);

    const videoDescription =
      typeof description === "string" && description.trim()
        ? description.trim().slice(0, 500)
        : null;

    // 4. Convert video to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 5. Upload directly to Cloudinary
    const cloudinaryForm = new FormData();

    cloudinaryForm.append(
      "file",
      new Blob([new Uint8Array(buffer)], { type: file.type }),
      file.name
    );

    cloudinaryForm.append("folder", "video-uploads");

    const authorization = Buffer.from(
      `${apiKey}:${apiSecret}`
    ).toString("base64");

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
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
          `Cloudinary video upload failed (${cloudinaryResponse.status}).`
      );
    }

    const result = responseBody as CloudinaryUploadResult;
    uploadedPublicId = result.public_id;

    // 6. Save video metadata in PostgreSQL
    const video = await prisma.video.create({
      data: {
        userId,
        title: videoTitle,
        description: videoDescription,
        publicId: result.public_id,
        originalSize: file.size,
        compressedSize: result.bytes,
        duration: result.duration ?? null,
      },
    });

    // 7. Create notification if upload notifications are enabled
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
            title: "Video uploaded successfully",
            message: `"${videoTitle}" has been uploaded to your media library.`,
            href: "/home/media?type=video",
          },
        });
      }
    } catch (notificationError) {
      // Notification failure must not affect a successful upload.
      console.error(
        "Video upload notification failed:",
        notificationError
      );
    }

    // 8. Return saved video
    return NextResponse.json(
      {
        message: "Video uploaded successfully.",
        video,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Video upload failed:", error);

    // 9. Remove Cloudinary asset if database saving failed
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId, {
          resource_type: "video",
        });
      } catch (cleanupError) {
        console.error("Cloudinary video cleanup failed:", cleanupError);
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Video upload failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
