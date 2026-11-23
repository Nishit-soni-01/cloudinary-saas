import { NextResponse, connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await connection();

  try {
   
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // 2. Verify Cloudinary configuration
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      return NextResponse.json(
        { error: "Cloudinary configuration is missing." },
        { status: 500 }
      );
    }

    // 3. Fetch images and videos belonging to this user
    const [images, videos] = await Promise.all([
      prisma.image.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),

      prisma.video.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // 4. Format image assets
    const imageAssets = images.map((image) => ({
      id: image.id,
      title:
        image.title ||
        image.publicId.split("/").pop() ||
        "Untitled image",
      publicId: image.publicId,
      type: "image" as const,
      url: `https://res.cloudinary.com/${cloudName}/image/upload/${image.publicId}`,
      format: image.format,
      size: image.size,
      width: image.width,
      height: image.height,
      duration: null,
      createdAt: image.createdAt,
    }));

    // 5. Format video assets
    const videoAssets = videos.map((video) => ({
      id: video.id,
      title: video.title,
      publicId: video.publicId,
      type: "video" as const,
      url: `https://res.cloudinary.com/${cloudName}/video/upload/${video.publicId}`,
      format: null,
      size: video.originalSize,
      width: null,
      height: null,
      duration: video.duration,
      createdAt: video.createdAt,
    }));

    // 6. Combine and sort assets
    const media = [...imageAssets, ...videoAssets].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    // 7. Return media library
    return NextResponse.json(
      {
        media,
        stats: {
          totalAssets: media.length,
          totalImages: images.length,
          totalVideos: videos.length,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Media library API error:", error);

    return NextResponse.json(
      { error: "Unable to load your media library." },
      { status: 500 }
    );
  }
}
