# MedStore ERP — User Guide

**Medical Store / Pharmacy Management Software**
Version 2.0 | Last updated: April 2026

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard](#2-dashboard)
3. [Billing / POS](#3-billing--pos)
4. [Medicines (Inventory)](#4-medicines-inventory)
5. [Purchases](#5-purchases)
6. [Expiry Tracker](#6-expiry-tracker)
7. [Customers](#7-customers)
8. [Suppliers](#8-suppliers)
9. [Prescriptions](#9-prescriptions)
10. [Reports](#10-reports)
11. [GST Reports](#11-gst-reports)
12. [Alerts & Notifications](#12-alerts--notifications)
13. [User Management](#13-user-management)
14. [Settings](#14-settings)
15. [Roles & Permissions](#15-roles--permissions)
16. [FAQ & Troubleshooting](#16-faq--troubleshooting)

---

## 1. Getting Started

### Logging In

1. Open the application URL in your browser (Chrome, Edge, or Firefox recommended).
2. Enter your **Email** and **Password**.
3. Click **Sign In**.
4. You will be redirected to the Dashboard.

> **Default Admin Login** (first-time setup):
> - Email: `admin@medstore.com`
> - Password: `admin123`
> - *Change this password immediately after first login from the Users page.*

### Navigation

- **Desktop**: Use the sidebar on the left to navigate between modules. Click the arrow button to collapse/expand the sidebar.
- **Mobile/Tablet**: Tap the menu icon (three lines) at the top-left corner to open the sidebar. Tap any page link to navigate, and the menu will close automatically.

---

## 2. Dashboard

The Dashboard provides a quick overview of your store's key metrics at a glance.

### What You See

| Card | Description |
|------|-------------|
| **Today's Sales** | Total revenue from today's invoices |
| **Monthly Revenue** | Total sales for the current month |
| **Monthly Profit** | Revenue minus purchase cost for the month |
| **Total Medicines** | Number of active medicines in inventory |
| **Expiring Soon** | Medicines expiring within 30 days |
| **Customers** | Total registered customers |

### Charts & Tables

- **Revenue Overview** — Line chart comparing sales vs. purchases over the last 6 months.
- **Top Selling Medicines** — Doughnut chart showing your best-selling products by units sold.
- **Recent Sales** — Quick view of the latest invoices with customer, amount, and payment mode.

---

## 3. Billing / POS

This is where you create invoices and manage daily sales.

### Creating a New Bill

1. Click **New Bill** to start a fresh billing session (clears any previous cart).
2. **Search** for a medicine by typing its name, generic name, or batch number in the search box.
3. Click on a medicine from the dropdown to **add it to the cart**.
4. Adjust **quantity** using the + / - buttons next to each item.
5. Select a **Customer** from the dropdown (or leave as "Walk-in Customer").
6. Choose the **Payment Mode** (Cash, UPI, Card, Net Banking, Wallet, or Credit).
7. Enter an optional **Discount** amount.
8. Click **Generate Invoice**.

### After Invoice is Generated

- The invoice preview appears automatically.
- Click **Download PDF** to save a copy.
- Click **Print** to print directly.

### Sales History

- Click **Sales History** to view all past invoices.
- For each sale, you can:
  - **View** the full invoice
  - **Download PDF**
  - **Return** the sale (restores stock)

---

## 4. Medicines (Inventory)

Manage your complete medicine inventory here.

### Viewing Medicines

- Use the **search bar** to find medicines by name, generic name, or composition.
- Use the **Category filter** dropdown to show only a specific category.
- Click the **expand arrow** on any medicine to view batch details (stock, prices, expiry dates).

### Adding a New Medicine

1. Click **Add Medicine**.
2. Fill in the details:
   - **Medicine Name** (required)
   - **Generic Name**, **Composition**, **Manufacturer** (optional but recommended)
   - **Category** — Select from the dropdown. Choose **"Other (add new)"** to create a custom category.
   - **HSN Code**, **GST Rate**, **Rack Location**, **Reorder Level**
   - **Prescription Required** — Check if this medicine requires a prescription.
3. Click **Add Medicine** to save.

### Custom Categories

When you select **"Other (add new)"** in the Category dropdown:
- A text field appears where you type your new category name (e.g., "Sachets", "Lozenges").
- On save, this new category is automatically available in all Category dropdowns throughout the app.

### Adding Stock / Batches

1. Click the **+** button on any medicine.
2. Enter batch details: Batch Number, Quantity, Purchase Price, Selling Price, MRP, Manufacturing Date, and Expiry Date.
3. Click **Add Batch**.

### Editing & Deleting

- Click the **pencil icon** to edit medicine details.
- Click the **trash icon** to delete a medicine (confirmation required).

---

## 5. Purchases

Record and track all purchases from suppliers.

### Summary Cards

- **Total Purchases** — Number of purchase entries
- **Total Value** — Combined purchase amount
- **Total Paid** — Amount already paid to suppliers
- **Pending Payments** — Number of unpaid/partially paid purchases

### Recording a New Purchase

1. Click **New Purchase**.
2. Select the **Supplier** and enter the **Invoice Number**.
3. Add purchase items — select medicine, enter batch details (batch number, quantity, prices, expiry date).
4. Set the **Payment Status** (Paid / Partial / Pending).
5. Click **Save Purchase**.

---

## 6. Expiry Tracker

Monitor medicines approaching or past their expiry dates.

### Summary Cards

| Card | Meaning |
|------|---------|
| **Expired** | Medicines already past expiry date (with total loss value) |
| **Critical (7d)** | Expiring within the next 7 days |
| **Warning (30d)** | Expiring within the next 30 days |
| **Watchlist (90d)** | Expiring within the next 90 days |

### Using Filters

Click any filter tab (Expired, 7 Days, 30 Days, 90 Days, All) to view the relevant batches.

### Exporting Data

Click **Export** to download the filtered expiry data as a CSV file for reporting or return processing.

---

## 7. Customers

Manage your customer database.

### Summary Cards

- **Total Customers** — Registered customer count
- **Dues** — Outstanding balance across all customers
- **Credit Accounts** — Customers with credit limits
- **Loyalty Points** — Total accumulated loyalty points

### Adding a Customer

1. Click **Add Customer**.
2. Enter: Name, Phone, Email, Address, GSTIN (optional), Gender, Credit Limit.
3. Click **Save**.

### Filtering

Use the filter tabs: **All**, **With Dues**, **Credit Accounts** to quickly find relevant customers.

---

## 8. Suppliers

Manage your supplier/vendor database.

### Information Tracked

- Supplier name, contact details, GSTIN
- Number of purchases from each supplier
- Total payable amount and pending dues

### Adding a Supplier

1. Click **Add Supplier**.
2. Enter: Name, Contact Person, Phone, Email, Address, GSTIN.
3. Click **Save**.

---

## 9. Prescriptions

Upload and manage customer prescriptions.

### How to Use

1. Click **Upload Prescription**.
2. Select the customer and attach the prescription image or details.
3. Prescriptions are linked to the customer record for future reference.

---

## 10. Reports

View detailed business analytics and reports.

### Available Reports

- **Sales Report** — Revenue breakdown by day, week, or month
- **Purchase Report** — Purchase spending over time
- **Profit & Loss** — Revenue vs. cost analysis
- **Inventory Valuation** — Current stock value at purchase/selling prices

Reports can be filtered by date range and exported for accounting purposes.

---

## 11. GST Reports

Generate GST-compliant tax reports.

### Summary Cards

- **Total Taxable** — Taxable amount before GST
- **CGST** — Central GST collected
- **SGST** — State GST collected
- **Total GST** — Combined GST amount

### Report Tabs

- **Sales GST** — GST breakdown from all sales invoices
- **Purchase GST** — Input GST from purchase invoices

These reports help with quarterly GST filing (GSTR-1, GSTR-3B).

---

## 12. Alerts & Notifications

Stay informed about critical events in your store.

### Alert Types

| Alert | Description |
|-------|-------------|
| **Expired Medicines** | List of batches past expiry date |
| **Expiring Soon** | Batches expiring within your configured alert window |
| **Low Stock** | Medicines below the reorder level |
| **Customer Dues** | Customers with outstanding balances |
| **Supplier Dues** | Pending payments to suppliers |

### SMS & Email Alerts

Configure phone number and email address in **Settings > Alerts & Thresholds** to receive notifications. Toggle SMS and Email on/off as needed.

---

## 13. User Management

*(Admin only)*

Manage who can access the system.

### Adding a User

1. Go to **Users**.
2. Click **Add User**.
3. Enter: Name, Email, Password, Role (Admin or Salesperson).
4. Click **Save**.

### User Roles

- **Admin** — Full access to all modules
- **Salesperson** — Limited access (see Roles & Permissions section below)

### Editing / Deactivating Users

- Click the edit icon to change a user's details or role.
- Deactivate a user to revoke their access without deleting their records.

---

## 14. Settings

*(Admin only)*

Configure your store's operational parameters.

### Sections

| Section | What You Configure |
|---------|-------------------|
| **Store Information** | Store name, address, phone, email |
| **Tax & Compliance** | GSTIN, Drug License No., PAN |
| **Invoice & Billing** | Invoice prefix, currency, receipt copies, footer message |
| **Alerts & Thresholds** | Low stock threshold, expiry alert days, SMS/Email notification contacts |
| **System Information** | View app version, database, and framework details |

### SMS & Email Notification Setup

1. Under **Alerts & Thresholds**, toggle **Enable SMS Notifications** on.
2. Enter the **phone number** where SMS alerts should be sent.
3. Toggle **Enable Email Notifications** on.
4. Enter the **email address** for email alerts.
5. Click **Save All Settings**.

---

## 15. Roles & Permissions

The application enforces access control based on user roles.

### Permission Matrix

| Module | Admin | Salesperson |
|--------|-------|-------------|
| Dashboard | Full Access | View Only |
| Billing / POS | Full Access | Full Access |
| Medicines | Full Access | View Only |
| Purchases | Full Access | No Access |
| Expiry Tracker | Full Access | View Only |
| Customers | Full Access | Full Access |
| Suppliers | Full Access | No Access |
| Prescriptions | Full Access | Full Access |
| Reports | Full Access | No Access |
| GST Reports | Full Access | No Access |
| Alerts | Full Access | View Only |
| Users | Full Access | No Access |
| Settings | Full Access | No Access |

### What the Access Levels Mean

- **Full Access** — Can view, add, edit, and delete data.
- **View Only** — Can see the data but cannot make changes. A yellow "View-only mode" banner appears at the top of the page.
- **No Access** — The page is hidden from the sidebar. If accessed directly via URL, an "Access Denied" message is shown.

---

## 16. FAQ & Troubleshooting

### Q: I forgot my password. How do I reset it?
Contact your administrator. They can update your password from the Users page.

### Q: The "Generate Invoice" button is greyed out. Why?
The button is disabled when the cart is empty. Search for a medicine and add it to the cart first.

### Q: I see "Access Denied" when trying to open a page.
Your account is a **Salesperson** role and that page is restricted to Admins. Contact your administrator if you need access.

### Q: How do I add a new medicine category?
When adding or editing a medicine, select **"Other (add new)"** from the Category dropdown. Type your new category name and save. It will be available globally from then on.

### Q: Can I undo a sale / return an invoice?
Yes. Go to **Billing / POS > Sales History**, find the invoice, and click the **Return** button. This will restore the stock to inventory.

### Q: How do I export expiry data?
Go to **Expiry Tracker**, select the desired filter (e.g., "30 Days"), and click the **Export** button. A CSV file will be downloaded.

### Q: The page is loading slowly or showing an error.
1. Check your internet connection.
2. Try refreshing the page (Ctrl + R or Cmd + R).
3. Clear your browser cache.
4. If the problem persists, contact your system administrator.

---

**Support:** For technical issues, contact your system administrator or the development team.

*MedStore ERP — Built for Indian Medical Stores & Pharmacies*
