import { promises as fs } from "fs";
import path from "path";

interface HealthData {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  database?: string;
}

export async function GET() {
  try {
    // Basic health check
    const healthData: HealthData = {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
    };

    // Check if we can access the file system (for JSON database)
    try {
      const dataDir = path.join(process.cwd(), "data");
      await fs.access(dataDir);
      healthData.database = "accessible";
    } catch {
      healthData.database = "error";
    }

    return Response.json(healthData, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
