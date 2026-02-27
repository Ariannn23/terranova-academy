const { Client } = require("pg");
require("dotenv").config();

async function migrate() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("No DATABASE_URL found");
    process.exit(1);
  }

  console.log("Connecting using:", url.replace(/:[^:@]+@/, ":***@"));
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected successfully");

    // Check if column exists
    const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Student' AND column_name='code';
    `);

    if (checkRes.rowCount === 0) {
      console.log("Adding column 'code' to 'Student'...");
      await client.query(`ALTER TABLE "Student" ADD COLUMN "code" TEXT;`);

      console.log("Creating unique index on 'code'...");
      await client.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS "Student_code_key" ON "Student"("code");`,
      );

      console.log("Migration complete!");
    } else {
      console.log("Column 'code' already exists.");
    }
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

migrate();
