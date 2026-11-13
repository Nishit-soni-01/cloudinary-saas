import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const imageId = body?.id;

    if (typeof imageId !== "string" || !imageId.trim()) {
      return NextResponse.json(
        { error: "A valid image ID is required." },
        { status: 400 }
      );
    }

    const image = await prisma.image.findFirst({
      where: {
        id: imageId,
        userId,
      },
    });

    if (!image) {
      return NextResponse.json(
        {
          error:
            "Image not found or you do not have permission to access it.",
        },
        { status: 404 }
      );
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      return NextResponse.json(
        { error: "Cloudinary configuration is missing." },
        { status: 500 }
      );
    }

    const originalUrl =
      `https://res.cloudinary.com/${cloudName}/image/upload/${image.publicId}`;

    const transformedUrl =
      `https://res.cloudinary.com/${cloudName}/image/upload/e_background_removal/f_png/${image.publicId}`;

    // Create background removal notification.
    // Notification errors must not interrupt the main operation.
    try {
      const preferences = await prisma.userPreference.findUnique({
        where: {
          userId,
        },
        select: {
          backgroundRemovalNotifications: true,
        },
      });

      if (preferences?.backgroundRemovalNotifications !== false) {
        await prisma.notification.create({
          data: {
            userId,
            type: "background_removal",
            title: "Background removal completed",
            message: `Background removal is ready for ${image.title || "Untitled image"}.`,
            href: "/home/background-remover",
          },
        });
      }
    } catch (notificationError) {
      console.error(
        "Failed to create background removal notification:",
        notificationError
      );
    }

    return NextResponse.json({
      message: "Background removal URL generated.",
      image: {
        id: image.id,
        title: image.title || "Untitled image",
        originalUrl,
        previewUrl: transformedUrl,
        downloadUrl: transformedUrl,
        format: "PNG",
      },
    });
  } catch (error) {
    console.error("Background removal API error:", error);

    return NextResponse.json(
      { error: "Unable to prepare background removal." },
      { status: 500 }
    );
  }
}