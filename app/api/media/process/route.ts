
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const MAX_DIMENSION = 5000;

type ImageFormat = "auto" | "webp" | "jpg" | "png";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the logged-in user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to process images." },
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
      format = "auto",
    } = body;

    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        { error: "A valid image ID is required." },
        { status: 400 }
      );
    }

    // 4. Find the image belonging to this user
    const image = await prisma.image.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: "Image not found or access denied." },
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

    // 6. Validate quality
    const validQuality =
      quality === "auto" ||
      (Number.isInteger(quality) &&
        Number(quality) >= 1 &&
        Number(quality) <= 100);

    if (!validQuality) {
      return NextResponse.json(
        { error: "Quality must be auto or a number between 1 and 100." },
        { status: 400 }
      );
    }

    // 7. Validate output format
    const allowedFormats: ImageFormat[] = [
      "auto",
      "webp",
      "jpg",
      "png",
    ];

    if (!allowedFormats.includes(format)) {
      return NextResponse.json(
        { error: "Unsupported image format." },
        { status: 400 }
      );
    }

    // 8. Build Cloudinary transformations
    const transformations: string[] = [];

    if (width || height) {
      const resizeParts = ["c_limit"];

      if (width) resizeParts.push(`w_${width}`);
      if (height) resizeParts.push(`h_${height}`);

      transformations.push(resizeParts.join(","));
    }

    transformations.push(
      typeof quality === "number"
        ? `q_${quality}`
        : "q_auto:good"
    );

    if (format !== "auto") {
      transformations.push(
        `f_${format === "jpg" ? "jpg" : format}`
      );
    } else {
      transformations.push("f_auto");
    }

    // 9. Safely construct the Cloudinary image URL
    const publicId = image.publicId
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    const transformationPath = transformations.join(",");

    const baseUrl =
      `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

    const previewUrl =
      `${baseUrl}/${transformationPath}/${publicId}`;

    // Force the browser to download the processed image
    const downloadUrl =
      `${baseUrl}/${transformationPath},fl_attachment/${publicId}`;

    // 10. Create notification if processing notifications are enabled
    try {
      const preferences = await prisma.userPreference.findUnique({
        where: { userId },
        select: {
          processingNotifications: true,
        },
      });

      // Notifications are enabled by default for users without preferences.
      if (preferences?.processingNotifications !== false) {
        await prisma.notification.create({
          data: {
            userId,
            type: "processing",
            title: "Image optimization completed",
            message: `"${image.title || "Your image"}" is ready with your selected optimization settings.`,
            href: "/home/image-studio",
          },
        });
      }
    } catch (notificationError) {
      // Notification failure must not affect image processing.
      console.error(
        "Image processing notification failed:",
        notificationError
      );
    }

    // 11. Return processed image details
    return NextResponse.json({
      message: "Image processed successfully.",
      image: {
        id: image.id,
        originalTitle: image.title,
        originalSize: image.size,
        width: width ?? null,
        height: height ?? null,
        quality,
        format,
        previewUrl,
        downloadUrl,
      },
    });
  } catch (error) {
    console.error("Image processing failed:", error);

    return NextResponse.json(
      { error: "Unable to process image. Please try again." },
      { status: 500 }
    );
  }
}
