import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { db } from './db.js';

const prisma = new PrismaClient();

const RoleName = Prisma.RoleName;

const ENUMS_TO_ENSURE = [
  {
    name: 'RoleName',
    values: [
      'SUPER_ADMIN',
      'ADMIN',
      'MANAGER',
      'INVENTORY_MANAGER',
      'ORDER_MANAGER',
      'CUSTOMER_SUPPORT',
      'CUSTOMER',
    ],
  },
  {
    name: 'OrderStatus',
    values: [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'PACKED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RETURN_REQUESTED',
      'RETURNED',
    ],
  },
  {
    name: 'PaymentStatus',
    values: ['PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
  },
  {
    name: 'PaymentProvider',
    values: ['RAZORPAY', 'STRIPE', 'CASH_ON_DELIVERY'],
  },
  {
    name: 'DiscountType',
    values: ['PERCENTAGE', 'FIXED_AMOUNT'],
  },
  {
    name: 'InventoryMovementType',
    values: ['RESTOCK', 'RESERVATION', 'RELEASE', 'SALE', 'RETURN', 'ADJUSTMENT'],
  },
  {
    name: 'ReturnStatus',
    values: ['REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'REFUNDED', 'CANCELLED'],
  },
];

const ROLES: { name: typeof RoleName; description: string }[] = [
  {
    name: RoleName.SUPER_ADMIN,
    description: 'Super Administrator with unrestricted access across all systems and domains',
  },
  {
    name: RoleName.ADMIN,
    description: 'System administrator with management access across products, orders and staff',
  },
  {
    name: RoleName.MANAGER,
    description: 'Operations and general store manager',
  },
  {
    name: RoleName.INVENTORY_MANAGER,
    description: 'Warehouse manager with product stock and adjustment privileges',
  },
  {
    name: RoleName.ORDER_MANAGER,
    description: 'Order fulfillment, shipments, and tracking manager',
  },
  {
    name: RoleName.CUSTOMER_SUPPORT,
    description: 'Customer service support for queries, reviews, and returns',
  },
  {
    name: RoleName.CUSTOMER,
    description: 'Standard registered storefront retail customer',
  },
];

const PERMISSIONS = [
  // Products
  { action: 'products:create', description: 'Create product catalog items and variants' },
  { action: 'products:read', description: 'View product catalog items and details' },
  { action: 'products:update', description: 'Update product information and prices' },
  { action: 'products:delete', description: 'Delete product catalog items' },

  // Orders
  { action: 'orders:create', description: 'Create and place customer orders' },
  { action: 'orders:read', description: 'View orders and order histories' },
  { action: 'orders:update', description: 'Update order fulfillment status' },
  { action: 'orders:cancel', description: 'Cancel existing orders' },

  // Inventory
  { action: 'inventory:read', description: 'View stock levels across warehouses' },
  { action: 'inventory:update', description: 'Adjust physical and reserved stock levels' },

  // Customers
  { action: 'customers:read', description: 'View customer accounts and profiles' },
  { action: 'customers:update', description: 'Update customer status and moderation' },
  { action: 'customers:delete', description: 'Remove customer accounts' },

  // Employees
  { action: 'employees:create', description: 'Register new employee and staff members' },
  { action: 'employees:read', description: 'List and view staff member profiles' },
  { action: 'employees:update', description: 'Update staff member roles and status' },
  { action: 'employees:delete', description: 'Remove staff member accounts' },

  // Coupons
  { action: 'coupons:create', description: 'Create discount coupons and promotions' },
  { action: 'coupons:read', description: 'View coupon configurations' },
  { action: 'coupons:update', description: 'Update or deactivate discount coupons' },
  { action: 'coupons:delete', description: 'Delete discount coupons' },

  // Shipping
  { action: 'shipping:read', description: 'View shipping methods and shipments' },
  { action: 'shipping:update', description: 'Update shipment tracking and delivery states' },

  // Reviews
  { action: 'reviews:read', description: 'View product reviews' },
  { action: 'reviews:moderate', description: 'Approve, reject, or moderate product reviews' },

  // Analytics
  { action: 'analytics:read', description: 'Access revenue, sales, and operational analytics' },
];

export async function seed() {
  console.log('--- Starting Database Seed ---');

  // 1. Ensure Postgres Enums & Implicit Casts exist
  console.log('1. Ensuring Postgres enum types & casts exist...');
  for (const e of ENUMS_TO_ENSURE) {
    const valList = e.values.map((v) => `'${v}'`).join(', ');
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "${e.name}" AS ENUM (${valList});
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE CAST (text AS "${e.name}") WITH INOUT AS IMPLICIT;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE CAST ("${e.name}" AS text) WITH INOUT AS IMPLICIT;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
  }
  console.log('   ✓ Enums and casts verified.');

  // 2. Seed Roles
  console.log('2. Seeding roles...');
  const roleMap = new Map<Prisma.RoleName, string>();

  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: {
        name: r.name,
        description: r.description,
      },
    });
    roleMap.set(r.name, role.id);
  }
  console.log(`   ✓ ${ROLES.length} roles verified in database.`);

  // 3. Seed Permissions
  console.log('3. Seeding permissions...');
  const permissionMap = new Map<string, string>();

  for (const p of PERMISSIONS) {
    const perm = await prisma.permission.upsert({
      where: { action: p.action },
      update: { description: p.description },
      create: {
        action: p.action,
        description: p.description,
      },
    });
    permissionMap.set(p.action, perm.id);
  }
  console.log(`   ✓ ${PERMISSIONS.length} permissions verified.`);

  // 4. Assign Permissions to Roles
  console.log('4. Linking role permissions...');
  const superAdminRoleId = roleMap.get(RoleName);
  if (superAdminRoleId) {
    for (const permId of permissionMap.values()) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRoleId,
            permissionId: permId,
          },
        },
        update: {},
        create: {
          roleId: superAdminRoleId,
          permissionId: permId,
        },
      });
    }
  }

  const adminRoleId = roleMap.get(RoleName.ADMIN);
  if (adminRoleId) {
    for (const [action, permId] of permissionMap.entries()) {
      // Admin gets all except deleting other employees
      if (action !== 'employees:delete') {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: adminRoleId,
              permissionId: permId,
            },
          },
          update: {},
          create: {
            roleId: adminRoleId,
            permissionId: permId,
          },
        });
      }
    }
  }
  console.log('   ✓ Role permissions linked.');

  // 5. Seed Initial Super Admin User
  console.log('5. Ensuring initial Super Admin user exists...');
  const adminEmail = (process.env['INITIAL_ADMIN_EMAIL'] || 'admin@songeroy.com').toLowerCase();
  const adminPassword = process.env['INITIAL_ADMIN_PASSWORD'] || 'AdminPassword123!';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { userRoles: true },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const superAdminRole = roleMap.get(RoleName.SUPER_ADMIN)!;
    const adminRole = roleMap.get(RoleName.ADMIN)!;

    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: 'System',
        lastName: 'Administrator',
        phoneNumber: '+919876543210',
        isEmailVerified: true,
        isActive: true,
        userRoles: {
          create: [{ roleId: superAdminRole }, { roleId: adminRole }],
        },
      },
    });

    console.log(`   ✓ Created Super Admin account: ${newAdmin.email}`);
    console.log(`     Credentials -> Email: ${adminEmail} | Password: ${adminPassword}`);
  } else {
    console.log(`   ✓ Super Admin account already exists: ${existingAdmin.email}`);
  }

  console.log('--- Database Seed Complete ---');
}

// Auto-run when executed directly via Node / CLI
if (process.argv[1]?.includes('seed')) {
  seed()
    .catch((error) => {
      console.error('Seed execution error:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
