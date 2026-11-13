
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET notifications error:", error);

    return NextResponse.json(
      { error: "Failed to fetch notifications." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (body.markAllRead === true) {
      await prisma.notification.updateMany({
        where: {
          userId,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "All notifications marked as read.",
      });
    }

    if (typeof body.id !== "string" || !body.id.trim()) {
      return NextResponse.json(
        { error: "A valid notification ID is required." },
        { status: 400 }
      );
    }

    const result = await prisma.notification.updateMany({
      where: {
        id: body.id,
        userId,
      },
      data: {
        readAt: new Date(),
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Notification not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error("PATCH notifications error:", error);

    return NextResponse.json(
      { error: "Failed to update notifications." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.notification.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      message: "Notifications cleared successfully.",
    });
  } catch (error) {
    console.error("DELETE notifications error:", error);

    return NextResponse.json(
      { error: "Failed to clear notifications." },
      { status: 500 }
    );
  }
}
