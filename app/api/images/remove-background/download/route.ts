import { NextRequest, NextResponse, connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const imageId = request.nextUrl.searchParams.get("id");

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required." },
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
        { error: "Image not found." },
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

    const cloudinaryUrl =
      `https://res.cloudinary.com/${cloudName}/image/upload/e_background_removal/f_png/${image.publicId}`;

    const cloudinaryResponse = await fetch(cloudinaryUrl, {
      cache: "no-store",
    });

    if (!cloudinaryResponse.ok || !cloudinaryResponse.body) {
      return NextResponse.json(
        {
          error:
            cloudinaryResponse.status === 423
              ? "Background removal is still processing. Please try again shortly."
              : "Unable to retrieve the processed image from Cloudinary.",
        },
        {
          status: cloudinaryResponse.status === 423 ? 423 : 502,
        }
      );
    }

    const filename = `background-removed-${image.id}.png`;

    return new NextResponse(cloudinaryResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Background removal download error:", error);

    return NextResponse.json(
      { error: "Unable to download the processed image." },
      { status: 500 }
    );
  }
}