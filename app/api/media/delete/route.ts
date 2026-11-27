
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: NextRequest) {
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

    if (typeof assetId !== "string" || !assetId.trim()) {
      return NextResponse.json(
        { error: "A valid media ID is required." },
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
        { error: "Media not found or you do not have permission to delete it." },
        { status: 404 }
      );
    }

    const asset = image || video;
    const resourceType = image ? "image" : "video";

    if (!asset) {
      return NextResponse.json(
        { error: "Media not found." },
        { status: 404 }
      );
    }

    // Delete the Cloudinary asset
    const cloudinaryResult = await cloudinary.uploader.destroy(
      asset.publicId,
      { resource_type: resourceType }
    );

    // Cloudinary returns "not found" if the asset was already removed.
    if (
      cloudinaryResult.result !== "ok" &&
      cloudinaryResult.result !== "not found"
    ) {
      console.error("Cloudinary deletion failed:", cloudinaryResult);

      return NextResponse.json(
        { error: "Unable to delete the file from Cloudinary." },
        { status: 502 }
      );
    }

    // Delete the corresponding database record
    if (image) {
      await prisma.image.delete({
        where: { id: image.id },
      });
    } else if (video) {
      await prisma.video.delete({
        where: { id: video.id },
      });
    }

    return NextResponse.json({
      message: "Media deleted successfully.",
      deletedId: asset.id,
    });
  } catch (error) {
    console.error("Media deletion failed:", error);

    return NextResponse.json(
      { error: "Unable to delete media. Please try again." },
      { status: 500 }
    );
  }
}
