import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const tables = [
  "PurchaseItem", "SaleItem", "Payment", "AuditLog",
  "Prescription", "Notification", "Purchase", "Sale",
  "Batch", "Medicine", "Customer", "Supplier", "Setting", "User",
];

async function main() {
  console.log("Clearing all tables in Turso database...");
  for (const t of tables) {
    try {
      await db.execute(`DELETE FROM "${t}"`);
      console.log(`  ✓ Cleared ${t}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${t}: ${msg}`);
    }
  }
  console.log("Done!");
}

main().catch(console.error);
