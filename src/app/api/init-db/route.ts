import { NextRequest, NextResponse } from "next/server";
import { initDatabase } from "@/lib/postgres";

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 Initializing Neon database...");

    // Check if we have database URL
    if (!process.env.NEON_DATABASE_URL) {
      return NextResponse.json(
        {
          error: "Database not configured",
          message: "NEON_DATABASE_URL not found in environment variables",
        },
        { status: 500 }
      );
    }

    // Initialize database tables
    await initDatabase();

    return NextResponse.json(
      {
        message: "✅ Neon database initialized successfully!",
        timestamp: new Date().toISOString(),
        database: "Neon PostgreSQL",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Database initialization failed:", error);

    return NextResponse.json(
      {
        error: "Database initialization failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
