import { NextResponse, connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await connection();

  try {
    // Authenticate the current user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Fetch only this user's videos
    const videos = await prisma.video.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(videos, { status: 200 });
  } catch (error) {
    console.error("Error fetching videos:", error);

    return NextResponse.json(
      { error: "Error fetching videos." },
      { status: 500 }
    );
  }
}