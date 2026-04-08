import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const statements = [
  // Add new columns to Customer table (SQLite ALTER TABLE only supports ADD COLUMN)
  `ALTER TABLE "Customer" ADD COLUMN "gstin" TEXT`,
  `ALTER TABLE "Customer" ADD COLUMN "dob" DATETIME`,
  `ALTER TABLE "Customer" ADD COLUMN "gender" TEXT`,
  `ALTER TABLE "Customer" ADD COLUMN "loyaltyPoints" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "Customer" ADD COLUMN "creditLimit" REAL NOT NULL DEFAULT 0`,

  // Create Prescription table
  `CREATE TABLE IF NOT EXISTS "Prescription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientName" TEXT NOT NULL,
    "doctorName" TEXT,
    "doctorPhone" TEXT,
    "diagnosis" TEXT,
    "notes" TEXT,
    "imageData" TEXT,
    "customerId" TEXT,
    "saleId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Prescription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Prescription_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,

  // Create Notification table
  `CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "read" INTEGER NOT NULL DEFAULT 0,
    "entityId" TEXT,
    "entityType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

async function run() {
  for (const sql of statements) {
    try {
      await client.execute(sql);
      console.log("OK:", sql.substring(0, 60) + "...");
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("duplicate column") || msg.includes("already exists")) {
        console.log("SKIP (already exists):", sql.substring(0, 60) + "...");
      } else {
        console.error("ERROR:", msg, "\nSQL:", sql.substring(0, 100));
      }
    }
  }
  console.log("\nSchema push complete!");
}

run();
