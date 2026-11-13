
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const defaultPreferences = {
  theme: "dark",
  uploadNotifications: true,
  processingNotifications: true,
  backgroundRemovalNotifications: true,
  securityNotifications: true,
};

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const preferences = await prisma.userPreference.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        ...defaultPreferences,
      },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Settings GET error:", error);

    return NextResponse.json(
      { error: "Unable to load settings." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const allowedFields = [
      "theme",
      "uploadNotifications",
      "processingNotifications",
      "backgroundRemovalNotifications",
      "securityNotifications",
    ] as const;

    const updates: Record<string, string | boolean> = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        const value = body[field];

        if (field === "theme") {
          if (value !== "dark" && value !== "light" && value !== "system") {
            return NextResponse.json(
              { error: "Invalid theme." },
              { status: 400 }
            );
          }
        } else if (typeof value !== "boolean") {
          return NextResponse.json(
            { error: `Invalid value for ${field}.` },
            { status: 400 }
          );
        }

        updates[field] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid settings provided." },
        { status: 400 }
      );
    }

    const preferences = await prisma.userPreference.upsert({
      where: { userId },
      update: updates,
      create: {
        userId,
        ...defaultPreferences,
        ...updates,
      },
    });

    return NextResponse.json({
      message: "Settings saved successfully.",
      preferences,
    });
  } catch (error) {
    console.error("Settings PATCH error:", error);

    return NextResponse.json(
      { error: "Unable to save settings." },
      { status: 500 }
    );
  }
}
