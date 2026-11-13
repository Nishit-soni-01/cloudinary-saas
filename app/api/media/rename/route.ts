
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    const assetId = body?.id;
    const newTitle = body?.title;

    if (typeof assetId !== "string" || !assetId.trim()) {
      return NextResponse.json(
        { error: "A valid media ID is required." },
        { status: 400 }
      );
    }

    if (typeof newTitle !== "string" || !newTitle.trim()) {
      return NextResponse.json(
        { error: "Please provide a valid title." },
        { status: 400 }
      );
    }

    const title = newTitle.trim();

    if (title.length > 100) {
      return NextResponse.json(
        { error: "Title cannot exceed 100 characters." },
        { status: 400 }
      );
    }

    const [image, video] = await Promise.all([
      prisma.image.findFirst({
        where: { id: assetId, userId },
      }),
      prisma.video.findFirst({
        where: { id: assetId, userId },
      }),
    ]);

    if (!image && !video) {
      return NextResponse.json(
        { error: "Media not found or you do not have permission to rename it." },
        { status: 404 }
      );
    }

    const updatedAsset = image
      ? await prisma.image.update({
          where: { id: image.id },
          data: { title },
        })
      : await prisma.video.update({
          where: { id: video!.id },
          data: { title },
        });

    return NextResponse.json({
      message: "Media renamed successfully.",
      id: updatedAsset.id,
      title: updatedAsset.title,
    });
  } catch (error) {
    console.error("Media rename failed:", error);

    return NextResponse.json(
      { error: "Unable to rename media. Please try again." },
      { status: 500 }
    );
  }
}
