import "dotenv/config";

if (!process.env.DATABASE_URL && !process.env.TURSO_DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

async function createSeedClient() {
  const { PrismaClient } = await import("@prisma/client");

  if (process.env.TURSO_DATABASE_URL) {
    const { PrismaLibSql } = await import("@prisma/adapter-libsql");
    const adapter = new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter } as any);
  }

  const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || "file:./dev.db",
  });
  return new PrismaClient({ adapter } as any);
}

async function main() {
  const prisma = await createSeedClient();
  const { hash } = await import("bcryptjs");

  console.log("Seeding database...");

  const adminPassword = await hash("admin123", 12);
  const staffPassword = await hash("staff123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@medstore.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@medstore.com",
      password: adminPassword,
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "staff@medstore.com" },
    update: {},
    create: {
      name: "Staff User",
      email: "staff@medstore.com",
      password: staffPassword,
      role: "salesperson",
    },
  });

  const settings = [
    { key: "storeName", value: "MedStore ERP" },
    { key: "storeAddress", value: "123 Health Street, Medical Colony" },
    { key: "storePhone", value: "9876543210" },
    { key: "storeEmail", value: "contact@medstore.com" },
    { key: "storeGstin", value: "29AABCU9603R1ZM" },
    { key: "storeDrugLicense", value: "DL-20B-12345" },
    { key: "invoicePrefix", value: "INV" },
    { key: "lowStockThreshold", value: "10" },
    { key: "expiryAlertDays", value: "30" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  const supplier1 = await prisma.supplier.create({
    data: { name: "ABC Pharma Distributors", phone: "9812345678", email: "abc@pharma.com", address: "456 Trade Center, Industrial Area", gstin: "29AABCU1234R1ZM", drugLicense: "DL-20B-67890" },
  });

  const supplier2 = await prisma.supplier.create({
    data: { name: "MedSupply India Pvt Ltd", phone: "9823456789", email: "info@medsupply.in", address: "789 Wholesale Market, City Center", gstin: "29BBCTU5678S2YN" },
  });

  const customer1 = await prisma.customer.create({ data: { name: "Ramesh Kumar", phone: "9876543210", email: "ramesh@email.com", address: "101 Residential Colony" } });
  const customer2 = await prisma.customer.create({ data: { name: "Sunita Devi", phone: "9887654321", address: "202 Green Park" } });
  await prisma.customer.create({ data: { name: "Anil Sharma", phone: "9898765432", email: "anil@email.com" } });

  const medicines = [
    { name: "Paracetamol 500mg", genericName: "Paracetamol", composition: "Paracetamol IP 500mg", category: "Tablet", manufacturer: "Cipla", hsnCode: "3004", gstRate: 12 },
    { name: "Amoxicillin 250mg", genericName: "Amoxicillin", composition: "Amoxicillin Trihydrate IP 250mg", category: "Capsule", manufacturer: "Ranbaxy", hsnCode: "3004", gstRate: 12, prescriptionReq: true },
    { name: "Cetirizine 10mg", genericName: "Cetirizine", composition: "Cetirizine Dihydrochloride 10mg", category: "Tablet", manufacturer: "Dr. Reddy's", hsnCode: "3004", gstRate: 12 },
    { name: "Omeprazole 20mg", genericName: "Omeprazole", composition: "Omeprazole IP 20mg", category: "Capsule", manufacturer: "Sun Pharma", hsnCode: "3004", gstRate: 12, prescriptionReq: true },
    { name: "Azithromycin 500mg", genericName: "Azithromycin", composition: "Azithromycin IP 500mg", category: "Tablet", manufacturer: "Cipla", hsnCode: "3004", gstRate: 12, prescriptionReq: true },
    { name: "Cough Syrup (Benadryl)", genericName: "Diphenhydramine", composition: "Diphenhydramine HCl 14.08mg/5ml", category: "Syrup", manufacturer: "Johnson & Johnson", hsnCode: "3004", gstRate: 12 },
    { name: "Ibuprofen 400mg", genericName: "Ibuprofen", composition: "Ibuprofen IP 400mg", category: "Tablet", manufacturer: "Abbott", hsnCode: "3004", gstRate: 12 },
    { name: "Metformin 500mg", genericName: "Metformin", composition: "Metformin Hydrochloride IP 500mg", category: "Tablet", manufacturer: "USV", hsnCode: "3004", gstRate: 5, prescriptionReq: true },
    { name: "Atorvastatin 10mg", genericName: "Atorvastatin", composition: "Atorvastatin Calcium IP 10mg", category: "Tablet", manufacturer: "Zydus", hsnCode: "3004", gstRate: 12, prescriptionReq: true },
    { name: "Pantoprazole 40mg", genericName: "Pantoprazole", composition: "Pantoprazole Sodium IP 40mg", category: "Tablet", manufacturer: "Alkem", hsnCode: "3004", gstRate: 12 },
    { name: "Betadine Ointment", genericName: "Povidone Iodine", composition: "Povidone Iodine IP 5% w/w", category: "Ointment", manufacturer: "Win-Medicare", hsnCode: "3004", gstRate: 18 },
    { name: "Dolo 650", genericName: "Paracetamol", composition: "Paracetamol IP 650mg", category: "Tablet", manufacturer: "Micro Labs", hsnCode: "3004", gstRate: 12 },
    { name: "ORS Powder", genericName: "Oral Rehydration Salt", composition: "Sodium Chloride, Potassium Chloride", category: "Powder", manufacturer: "Electral", hsnCode: "3004", gstRate: 5 },
    { name: "Eye Drops (Refresh)", genericName: "Carboxymethylcellulose", composition: "CMC Sodium 0.5%", category: "Drops", manufacturer: "Allergan", hsnCode: "3004", gstRate: 12 },
    { name: "Salbutamol Inhaler", genericName: "Salbutamol", composition: "Salbutamol 100mcg/dose", category: "Inhaler", manufacturer: "Cipla", hsnCode: "3004", gstRate: 12, prescriptionReq: true },
  ];

  const createdMedicines: any[] = [];
  for (const med of medicines) {
    const m = await prisma.medicine.create({
      data: { ...med, rackLocation: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}-${Math.floor(Math.random() * 20 + 1)}`, reorderLevel: Math.floor(Math.random() * 15 + 5) },
    });
    createdMedicines.push(m);
  }

  console.log(`  Created ${createdMedicines.length} medicines`);

  const now = new Date();
  let batchCount = 0;
  for (const med of createdMedicines) {
    const numBatches = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numBatches; i++) {
      const purchasePrice = Math.round((Math.random() * 50 + 5) * 100) / 100;
      const sellingPrice = Math.round(purchasePrice * (1.2 + Math.random() * 0.3) * 100) / 100;
      const mrp = Math.round(sellingPrice * (1.05 + Math.random() * 0.15) * 100) / 100;
      const monthsAhead = Math.floor(Math.random() * 24) + 1;
      const expiryDate = new Date(now.getFullYear(), now.getMonth() + monthsAhead, 1);
      const expiry = i === 0 && Math.random() < 0.3 ? new Date(now.getTime() + (Math.random() * 30 + 5) * 24 * 60 * 60 * 1000) : expiryDate;

      await prisma.batch.create({
        data: {
          medicineId: med.id,
          batchNumber: `BT-${now.getFullYear()}-${String(Math.floor(Math.random() * 9000 + 1000))}`,
          mrp, purchasePrice, sellingPrice,
          quantity: Math.floor(Math.random() * 200 + 20),
          mfgDate: new Date(now.getFullYear(), now.getMonth() - 6, 1),
          expiryDate: expiry,
        },
      });
      batchCount++;
    }
  }

  console.log(`  Created ${batchCount} batches`);

  const batches = await prisma.batch.findMany({ where: { quantity: { gt: 10 } }, include: { medicine: true }, take: 8 });

  for (let i = 0; i < 5; i++) {
    const batch = batches[i % batches.length];
    const qty = Math.floor(Math.random() * 5) + 1;
    const lineTotal = qty * batch.sellingPrice;
    const gstAmount = (lineTotal * batch.medicine.gstRate) / (100 + batch.medicine.gstRate);
    const custId = i % 2 === 0 ? customer1.id : i % 3 === 0 ? customer2.id : null;
    const saleDate = new Date(now);
    saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 30));

    await prisma.sale.create({
      data: {
        invoiceNumber: `INV-${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${String(1000 + i)}`,
        customerId: custId, userId: admin.id,
        subtotal: lineTotal, gstAmount, totalAmount: lineTotal,
        paymentMode: ["cash", "upi", "card"][Math.floor(Math.random() * 3)],
        createdAt: saleDate,
        items: { create: { medicineId: batch.medicineId, batchId: batch.id, quantity: qty, unitPrice: batch.sellingPrice, gstRate: batch.medicine.gstRate, gstAmount, totalAmount: lineTotal } },
      },
    });
    await prisma.batch.update({ where: { id: batch.id }, data: { quantity: { decrement: qty } } });
  }

  console.log("  Created 5 sample sales");

  const sampleMeds = createdMedicines.slice(0, 2);
  for (let i = 0; i < 2; i++) {
    const med = sampleMeds[i];
    const qty = Math.floor(Math.random() * 100 + 50);
    const price = Math.round((Math.random() * 30 + 5) * 100) / 100;
    const total = qty * price;
    const gst = (total * med.gstRate) / (100 + med.gstRate);
    const suppId = i === 0 ? supplier1.id : supplier2.id;

    const batch = await prisma.batch.create({
      data: {
        medicineId: med.id, batchNumber: `PB-${now.getFullYear()}-${String(Math.floor(Math.random() * 9000 + 1000))}`,
        mrp: Math.round(price * 1.4 * 100) / 100, purchasePrice: price,
        sellingPrice: Math.round(price * 1.25 * 100) / 100, quantity: qty,
        mfgDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
        expiryDate: new Date(now.getFullYear() + 2, now.getMonth(), 1),
      },
    });

    await prisma.purchase.create({
      data: {
        invoiceNumber: `SUP-INV-${1000 + i}`, supplierId: suppId,
        subtotal: total, gstAmount: gst, totalAmount: total,
        paymentStatus: i === 0 ? "paid" : "partial", paidAmount: i === 0 ? total : total * 0.5,
        items: { create: { medicineId: med.id, batchId: batch.id, quantity: qty, unitPrice: price, gstRate: med.gstRate, gstAmount: gst, totalAmount: total } },
      },
    });
  }

  console.log("  Created 2 sample purchases");
  console.log("\nDatabase seeded successfully!");
  console.log("\nDefault Login Credentials:");
  console.log("  Admin: admin@medstore.com / admin123");
  console.log("  Staff: staff@medstore.com / staff123");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
