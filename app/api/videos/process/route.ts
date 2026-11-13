
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const MAX_DIMENSION = 3840;

type VideoQuality = "auto" | "eco" | "good" | "best" | number;

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the logged-in user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to process videos." },
        { status: 401 }
      );
    }

    // 2. Check Cloudinary configuration
    if (!CLOUD_NAME) {
      return NextResponse.json(
        { error: "Cloudinary configuration is missing." },
        { status: 500 }
      );
    }

    // 3. Read processing options
    const body = await request.json();

    const {
      id,
      width,
      height,
      quality = "auto",
    } = body;

    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        { error: "A valid video ID is required." },
        { status: 400 }
      );
    }

    // 4. Find the video belonging to this user
    const video = await prisma.video.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found or access denied." },
        { status: 404 }
      );
    }

    // 5. Validate dimensions
    const validDimension = (value: unknown) =>
      value === undefined ||
      value === null ||
      (Number.isInteger(value) &&
        Number(value) >= 1 &&
        Number(value) <= MAX_DIMENSION);

    if (!validDimension(width) || !validDimension(height)) {
      return NextResponse.json(
        {
          error: `Width and height must be between 1 and ${MAX_DIMENSION}.`,
        },
        { status: 400 }
      );
    }

    // 6. Validate compression quality
    const validQuality =
      ["auto", "eco", "good", "best"].includes(quality) ||
      (Number.isInteger(quality) &&
        Number(quality) >= 1 &&
        Number(quality) <= 100);

    if (!validQuality) {
      return NextResponse.json(
        { error: "Invalid video compression quality." },
        { status: 400 }
      );
    }

    // 7. Build Cloudinary transformations
    const transformations: string[] = [];

    if (width || height) {
      const resizeParts = ["c_limit"];

      if (width) resizeParts.push(`w_${width}`);
      if (height) resizeParts.push(`h_${height}`);

      transformations.push(resizeParts.join(","));
    }

    if (typeof quality === "number") {
      transformations.push(`q_${quality}`);
    } else if (quality === "auto") {
      transformations.push("q_auto:good");
    } else {
      transformations.push(`q_auto:${quality}`);
    }

    // MP4 with H.264 for broad device compatibility
    transformations.push("f_mp4,vc_h264");

    const transformationPath = transformations.join("/");

    // 8. Encode the public ID safely
    const publicId = video.publicId
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    const baseUrl =
      `https://res.cloudinary.com/${CLOUD_NAME}/video/upload`;

    // 9. Generate preview and download URLs
    const previewUrl =
      `${baseUrl}/${transformationPath}/${publicId}.mp4`;

    const downloadUrl =
      `${baseUrl}/${transformationPath}/fl_attachment/${publicId}.mp4`;

    // 10. Create processing notification
    // Notification failure must not interrupt video processing.
    try {
      const preferences = await prisma.userPreference.findUnique({
        where: {
          userId,
        },
        select: {
          processingNotifications: true,
        },
      });

      if (preferences?.processingNotifications !== false) {
        await prisma.notification.create({
          data: {
            userId,
            type: "processing",
            title: "Video optimization completed",
            message: `${video.title} is ready with your selected optimization settings.`,
            href: "/home/video-studio",
          },
        });
      }
    } catch (notificationError) {
      console.error(
        "Failed to create video processing notification:",
        notificationError
      );
    }

    // 11. Return processing details
    return NextResponse.json({
      message: "Video processing URL generated successfully.",
      video: {
        id: video.id,
        title: video.title,
        originalSize: video.originalSize,
        duration: video.duration,
        requestedWidth: width ?? null,
        requestedHeight: height ?? null,
        quality,
        format: "mp4",
        previewUrl,
        downloadUrl,
      },
    });
  } catch (error) {
    console.error("Video processing failed:", error);

    return NextResponse.json(
      {
        error: "Unable to process video. Please try again.",
      },
      { status: 500 }
    );
  }
}
