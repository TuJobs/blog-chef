// Test Neon PostgreSQL connection
const { neon } = require("@neondatabase/serverless");

// Disable SSL certificate validation for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function testNeonConnection() {
  const connectionString =
    "postgresql://neondb_owner:npg_S4vadGptQAi6@ep-withered-bar-a1yy7c34-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

  console.log("🔗 Testing Neon PostgreSQL connection...");
  console.log("📍 Endpoint:", connectionString.split("@")[1].split("/")[0]);

  try {
    const sql = neon(connectionString);

    // Test basic connection
    console.log("⏳ Testing basic query...");
    const result =
      await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log("✅ Connection successful!");
    console.log("🕐 Current time:", result[0].current_time);
    console.log("🗄️  PostgreSQL version:", result[0].pg_version.split(" ")[0]);

    // Test table existence
    console.log("\n📋 Checking existing tables...");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    if (tables.length > 0) {
      console.log("📚 Found tables:");
      tables.forEach((table) => console.log(`  - ${table.table_name}`));
    } else {
      console.log("❌ No tables found in public schema");
    }

    // Test data count if tables exist
    if (tables.some((t) => t.table_name === "posts")) {
      const postCount = await sql`SELECT COUNT(*) as count FROM posts`;
      console.log(`📝 Posts count: ${postCount[0].count}`);
    }

    if (tables.some((t) => t.table_name === "users")) {
      const userCount = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`👥 Users count: ${userCount[0].count}`);
    }

    if (tables.some((t) => t.table_name === "comments")) {
      const commentCount = await sql`SELECT COUNT(*) as count FROM comments`;
      console.log(`💬 Comments count: ${commentCount[0].count}`);
    }

    console.log("\n🎉 All tests passed! Neon connection is working perfectly.");
  } catch (error) {
    console.error("❌ Connection test failed:");
    console.error("Error message:", error.message);

    if (error.message.includes("certificate")) {
      console.log("\n💡 SSL Certificate issue detected.");
      console.log(
        "🔧 Try adding NODE_TLS_REJECT_UNAUTHORIZED=0 to your environment."
      );
    }

    if (error.message.includes("authentication")) {
      console.log("\n🔐 Authentication issue detected.");
      console.log("🔧 Please verify your username and password.");
    }

    if (error.message.includes("connection")) {
      console.log("\n🌐 Network connection issue detected.");
      console.log("🔧 Please check your internet connection and endpoint URL.");
    }
  }
}

testNeonConnection();
