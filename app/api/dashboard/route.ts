import { NextResponse, connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await connection();

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Calculate the date range for the last 7 days.
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    // Fetch all dashboard information in parallel.
    const [
      imageCount,
      videoCount,
      imageStorage,
      videoStorage,
      recentImages,
      recentVideos,
      weeklyImages,
      weeklyVideos,
    ] = await Promise.all([
      // Total image count
      prisma.image.count({
        where: { userId },
      }),

      // Total video count
      prisma.video.count({
        where: { userId },
      }),

      // Total image storage
      prisma.image.aggregate({
        where: { userId },
        _sum: {
          size: true,
        },
      }),

      // Total video storage
      prisma.video.aggregate({
        where: { userId },
        _sum: {
          originalSize: true,
        },
      }),

      // Latest images
      prisma.image.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),

      // Latest videos
      prisma.video.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),

      // Images uploaded during the last 7 days
      prisma.image.findMany({
        where: {
          userId,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          createdAt: true,
        },
      }),

      // Videos uploaded during the last 7 days
      prisma.video.findMany({
        where: {
          userId,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    // Calculate storage usage.
    const imageStorageBytes = imageStorage._sum.size ?? 0;
    const videoStorageBytes = videoStorage._sum.originalSize ?? 0;

    const totalStorageBytes =
      imageStorageBytes + videoStorageBytes;

    // Combine recent images and videos.
    const recentUploads = [
      ...recentImages.map((image) => ({
        id: image.id,
        title: image.title || image.publicId,
        publicId: image.publicId,
        type: "image" as const,
        createdAt: image.createdAt,
        size: image.size,
      })),

      ...recentVideos.map((video) => ({
        id: video.id,
        title: video.title,
        publicId: video.publicId,
        type: "video" as const,
        createdAt: video.createdAt,
        size: video.originalSize,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 6);

    // Prepare the last 7 days of upload activity.
    const uploadActivity = Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date(sevenDaysAgo);
        date.setUTCDate(date.getUTCDate() + index);

        const dateKey = date.toISOString().slice(0, 10);

        const imageUploads = weeklyImages.filter(
          (image) =>
            image.createdAt.toISOString().slice(0, 10) === dateKey
        ).length;

        const videoUploads = weeklyVideos.filter(
          (video) =>
            video.createdAt.toISOString().slice(0, 10) === dateKey
        ).length;

        return {
          date: dateKey,
          images: imageUploads,
          videos: videoUploads,
          total: imageUploads + videoUploads,
        };
      }
    );

    return NextResponse.json(
      {
        stats: {
          totalAssets: imageCount + videoCount,
          totalImages: imageCount,
          totalVideos: videoCount,
          totalStorageBytes,
          imageStorageBytes,
          videoStorageBytes,
        },

        uploadActivity,
        recentUploads,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { error: "Unable to load dashboard data." },
      { status: 500 }
    );
  }
}