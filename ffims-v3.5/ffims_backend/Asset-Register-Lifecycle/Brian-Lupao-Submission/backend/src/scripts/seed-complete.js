import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import AssetCategory from '../models/AssetCategory.js';
import Asset from '../models/Asset.js';
import AssetLocation from '../models/AssetLocation.js';
import AssetTransaction from '../models/AssetTransaction.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import AuditLog from '../models/AuditLog.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ffims';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

console.log('🌱 Starting comprehensive FFIMS seed...');
console.log('📍 Database:', MONGODB_URI);

const USERS = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@ffims.com',
    password: 'Admin@123456',
    role: 'admin',
    emailVerified: true,
    username: 'admin_user',
  },
  {
    firstName: 'John',
    lastName: 'Manager',
    email: 'manager@ffims.com',
    password: 'Manager@123456',
    role: 'asset-manager',
    emailVerified: true,
    username: 'john_manager',
  },
  {
    firstName: 'Sarah',
    lastName: 'Technician',
    email: 'technician@ffims.com',
    password: 'Tech@123456',
    role: 'technician',
    emailVerified: true,
    username: 'sarah_tech',
  },
  {
    firstName: 'Michael',
    lastName: 'Technician2',
    email: 'technician2@ffims.com',
    password: 'Tech@123456',
    role: 'technician',
    emailVerified: true,
    username: 'michael_tech',
  },
  {
    firstName: 'Alice',
    lastName: 'User',
    email: 'user@ffims.com',
    password: 'User@123456',
    role: 'user',
    emailVerified: true,
    username: 'alice_user',
  },
  {
    firstName: 'Bob',
    lastName: 'Viewer',
    email: 'viewer@ffims.com',
    password: 'Viewer@123456',
    role: 'user',
    emailVerified: true,
    username: 'bob_viewer',
  },
];

const CATEGORIES = [
  { name: 'Vehicles', description: 'Fleet vehicles (cars, trucks, buses)' },
  { name: 'IT Equipment', description: 'Computers, servers, networking' },
  { name: 'Furniture', description: 'Office and facility furniture' },
  { name: 'Machinery', description: 'Industrial and maintenance equipment' },
  { name: 'Buildings', description: 'Facilities and structures' },
  { name: 'Lab Equipment', description: 'Laboratory and research instruments' },
];

const LOCATIONS = [
  { building: 'Administration Block', floor: '1', room: 'Admin Office' },
  { building: 'Science Building', floor: '2', room: 'IT Center' },
  { building: 'Maintenance Facility', floor: 'G', room: 'Garage' },
  { building: 'Central Library', floor: '3', room: 'Main Hall' },
  { building: 'Research Center', floor: '1', room: 'Lab A' },
];

const seedUsers = async () => {
  console.log('\n👤 Seeding users...');
  const createdUsers = [];

  for (const userData of USERS) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      console.log(`  ✓ ${userData.email} (already exists)`);
      createdUsers.push(existing);
      continue;
    }

    const hashedPassword = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);
    const user = await User.create({
      ...userData,
      password: hashedPassword,
      isActive: true,
    });
    console.log(`  ✓ ${userData.email} created`);
    createdUsers.push(user);
  }

  return createdUsers;
};

const seedCategories = async () => {
  console.log('\n📂 Seeding categories...');
  const createdCategories = [];

  for (const catData of CATEGORIES) {
    const existing = await AssetCategory.findOne({ name: catData.name });
    if (existing) {
      console.log(`  ✓ ${catData.name} (already exists)`);
      createdCategories.push(existing);
      continue;
    }

    const category = await AssetCategory.create({
      ...catData,
      depreciationMethod: 'straight-line',
    });
    console.log(`  ✓ ${catData.name} created`);
    createdCategories.push(category);
  }

  return createdCategories;
};

const seedLocations = async () => {
  console.log('\n🏢 Seeding locations...');
  const createdLocations = [];

  for (const locData of LOCATIONS) {
    const existing = await AssetLocation.findOne({ building: locData.building, floor: locData.floor });
    if (existing) {
      console.log(`  ✓ ${locData.building} - ${locData.room} (already exists)`);
      createdLocations.push(existing);
      continue;
    }

    const location = await AssetLocation.create(locData);
    console.log(`  ✓ ${locData.building} - ${locData.room} created`);
    createdLocations.push(location);
  }

  return createdLocations;
};

const seedAssets = async (categories, locations, users) => {
  console.log('\n🚗 Seeding assets...');
  const assetData = [
    // Vehicles
    {
      assetId: 'VEH-001',
      name: 'Toyota Hiace Bus',
      category: categories[0],
      location: locations[2],
      description: '20-seater passenger bus for student transportation',
      status: 'active',
      purchaseDate: new Date('2020-03-15'),
      purchaseCost: 45000,
      depreciationRate: 10,
      condition: 'Good',
      custodian: users[2],
    },
    {
      assetId: 'VEH-002',
      name: 'Pickup Truck',
      category: categories[0],
      location: locations[2],
      description: 'General utility pickup truck',
      status: 'active',
      purchaseDate: new Date('2019-06-20'),
      purchaseCost: 35000,
      depreciationRate: 12,
      condition: 'Fair',
      custodian: users[2],
    },
    {
      assetId: 'VEH-003',
      name: 'Toyota Corolla',
      category: categories[0],
      location: locations[2],
      description: 'Administrative vehicle',
      status: 'maintenance',
      purchaseDate: new Date('2021-01-10'),
      purchaseCost: 28000,
      depreciationRate: 8,
      condition: 'Good',
      custodian: users[1],
    },

    // IT Equipment
    {
      assetId: 'IT-001',
      name: 'Dell Enterprise Server',
      category: categories[1],
      location: locations[1],
      description: 'Main database and application server',
      status: 'active',
      purchaseDate: new Date('2022-02-14'),
      purchaseCost: 12000,
      depreciationRate: 15,
      condition: 'Excellent',
      custodian: users[1],
    },
    {
      assetId: 'IT-002',
      name: 'Cisco Network Switch',
      category: categories[1],
      location: locations[1],
      description: '48-port enterprise network switch',
      status: 'active',
      purchaseDate: new Date('2021-05-20'),
      purchaseCost: 8000,
      depreciationRate: 12,
      condition: 'Excellent',
      custodian: users[1],
    },
    {
      assetId: 'IT-003',
      name: 'HP Printer MT-4050',
      category: categories[1],
      location: locations[0],
      description: 'Multifunction printer for admin block',
      status: 'active',
      purchaseDate: new Date('2020-08-11'),
      purchaseCost: 3500,
      depreciationRate: 20,
      condition: 'Good',
      custodian: users[4],
    },

    // Furniture
    {
      assetId: 'FUR-001',
      name: 'Office Desk Set (10 units)',
      category: categories[2],
      location: locations[0],
      description: 'Executive wooden office desks',
      status: 'active',
      purchaseDate: new Date('2022-09-01'),
      purchaseCost: 5000,
      depreciationRate: 5,
      condition: 'Excellent',
      custodian: users[1],
    },
    {
      assetId: 'FUR-002',
      name: 'Conference Table',
      category: categories[2],
      location: locations[0],
      description: 'Large oak conference table with 12 chairs',
      status: 'active',
      purchaseDate: new Date('2019-11-05'),
      purchaseCost: 4000,
      depreciationRate: 4,
      condition: 'Good',
      custodian: users[0],
    },

    // Machinery
    {
      assetId: 'MAC-001',
      name: 'Hydraulic Lift System',
      category: categories[3],
      location: locations[2],
      description: 'Vehicle maintenance lift system',
      status: 'active',
      purchaseDate: new Date('2018-12-10'),
      purchaseCost: 15000,
      depreciationRate: 8,
      condition: 'Fair',
      custodian: users[2],
    },
    {
      assetId: 'MAC-002',
      name: 'Air Compressor',
      category: categories[3],
      location: locations[2],
      description: 'Industrial air compressor for maintenance',
      status: 'active',
      purchaseDate: new Date('2020-04-22'),
      purchaseCost: 5500,
      depreciationRate: 10,
      condition: 'Good',
      custodian: users[2],
    },

    // Lab Equipment
    {
      assetId: 'LAB-001',
      name: 'Spectrophotometer UV-3600',
      category: categories[5],
      location: locations[4],
      description: 'Advanced UV-Vis spectroscopy equipment',
      status: 'active',
      purchaseDate: new Date('2021-01-15'),
      purchaseCost: 25000,
      depreciationRate: 10,
      condition: 'Excellent',
      custodian: users[3],
    },
    {
      assetId: 'LAB-002',
      name: 'PCR Thermal Cycler',
      category: categories[5],
      location: locations[4],
      description: 'DNA amplification system',
      status: 'active',
      purchaseDate: new Date('2022-06-10'),
      purchaseCost: 18000,
      depreciationRate: 12,
      condition: 'Excellent',
      custodian: users[3],
    },
  ];

  const createdAssets = [];
  let assetCounter = 0;

  for (const data of assetData) {
    const existing = await Asset.findOne({ assetId: data.assetId });
    if (existing) {
      console.log(`  ✓ ${data.assetId} - ${data.name} (already exists)`);
      createdAssets.push(existing);
      assetCounter++;
      continue;
    }

    // Calculate current value based on depreciation
    const monthsOwned = Math.floor(
      (Date.now() - data.purchaseDate) / (1000 * 60 * 60 * 24 * 30)
    );
    const depreciation = (data.purchaseCost * data.depreciationRate * monthsOwned) / 1200;
    const currentValue = Math.max(0, data.purchaseCost - depreciation);

    const asset = await Asset.create({
      ...data,
      currentValue: Math.round(currentValue),
    });

    console.log(`  ✓ ${data.assetId} - ${data.name} created`);
    createdAssets.push(asset);
    assetCounter++;
  }

  console.log(`  Total assets: ${assetCounter}`);
  return createdAssets;
};

const seedMaintenanceLogs = async (assets, users) => {
  console.log('\n🔧 Seeding maintenance logs...');
  const now = new Date();
  const maintenanceData = [
    {
      assetId: assets[0],
      maintenanceDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      type: 'Oil Change',
      description: 'Regular oil and filter change',
      performedBy: users[2],
      cost: 150,
      nextMaintenanceDate: new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
    },
    {
      assetId: assets[0],
      maintenanceDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      type: 'Tire Rotation',
      description: 'Front and rear tire rotation',
      performedBy: users[2],
      cost: 200,
      nextMaintenanceDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
    },
    {
      assetId: assets[1],
      maintenanceDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      type: 'Engine Inspection',
      description: 'Full engine diagnostic and inspection',
      performedBy: users[2],
      cost: 500,
      nextMaintenanceDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
    },
    {
      assetId: assets[2],
      maintenanceDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      type: 'Transmission Service',
      description: 'Transmission fluid and filter service',
      performedBy: users[2],
      cost: 350,
      nextMaintenanceDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
    },
    {
      assetId: assets[4],
      maintenanceDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      type: 'Network Maintenance',
      description: 'Switch firmware upgrade and configuration backup',
      performedBy: users[1],
      cost: 400,
      nextMaintenanceDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
    },
    {
      assetId: assets[7],
      maintenanceDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      type: 'Calibration',
      description: 'Hydraulic system pressure calibration',
      performedBy: users[2],
      cost: 250,
      nextMaintenanceDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
    },
  ];

  let maintenanceCounter = 0;
  for (const data of maintenanceData) {
    const maintenance = await MaintenanceLog.create(data);
    maintenanceCounter++;
  }

  console.log(`  Created ${maintenanceCounter} maintenance records`);
};

const seedLifecycleTransactions = async (assets, users, locations) => {
  console.log('\n🔁 Seeding lifecycle transactions...');
  const now = new Date();

  const txData = [
    {
      assetId: assets[0]._id,
      transactionType: 'deployment',
      fromLocation: locations[0]._id,
      toLocation: locations[2]._id,
      performedBy: users[1]._id,
      notes: 'Allocated to maintenance team',
      timestamp: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000)
    },
    {
      assetId: assets[0]._id,
      transactionType: 'maintenance',
      fromLocation: locations[2]._id,
      toLocation: locations[2]._id,
      performedBy: users[2]._id,
      notes: 'Oil change and diagnostic',
      timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      assetId: assets[1]._id,
      transactionType: 'transfer',
      fromLocation: locations[2]._id,
      toLocation: locations[1]._id,
      performedBy: users[2]._id,
      notes: 'Moved to IT department',
      timestamp: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
    },
    {
      assetId: assets[3]._id,
      transactionType: 'maintenance',
      fromLocation: locations[1]._id,
      toLocation: locations[1]._id,
      performedBy: users[1]._id,
      notes: 'Server firmware update',
      timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    },
  ];

  let txCount = 0;
  for (const data of txData) {
    const existing = await AssetTransaction.findOne({ assetId: data.assetId, transactionType: data.transactionType, timestamp: data.timestamp });
    if (existing) {
      txCount++;
      continue;
    }
    await AssetTransaction.create(data);
    txCount++;
  }
  console.log(`  Created/updated ${txCount} lifecycle transactions`);
};

const seedAuditLogs = async (users, assets) => {
  console.log('\n📋 Seeding audit logs (activities)...');
  const now = new Date();
  const auditData = [];

  // Admin activities
  auditData.push({
    userId: users[0],
    action: 'CREATE',
    entityType: 'Asset',
    entityId: assets[0]._id,
    changes: { status: 'active', category: 'Vehicles' },
    timestamp: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
  });

  auditData.push({
    userId: users[0],
    action: 'LOGIN',
    entityType: 'User',
    entityId: users[0]._id,
    changes: { login: true },
    timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
  });

  // Manager activities
  auditData.push({
    userId: users[1],
    action: 'UPDATE',
    entityType: 'Asset',
    entityId: assets[2]._id,
    changes: { status: 'maintenance' },
    timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
  });

  auditData.push({
    userId: users[1],
    action: 'VIEW',
    entityType: 'Asset',
    entityId: assets[3]._id,
    changes: {},
    timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  });

  // Technician activities
  auditData.push({
    userId: users[2],
    action: 'CREATE',
    entityType: 'MaintenanceLog',
    entityId: assets[0]._id,
    changes: { type: 'Oil Change' },
    timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
  });

  auditData.push({
    userId: users[2],
    action: 'UPDATE',
    entityType: 'MaintenanceLog',
    entityId: assets[1]._id,
    changes: { status: 'completed' },
    timestamp: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
  });

  auditData.push({
    userId: users[2],
    action: 'VIEW',
    entityType: 'Asset',
    entityId: assets[4]._id,
    changes: {},
    timestamp: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
  });

  auditData.push({
    userId: users[3],
    action: 'CREATE',
    entityType: 'MaintenanceLog',
    entityId: assets[9]._id,
    changes: { type: 'Calibration' },
    timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
  });

  // User activities
  auditData.push({
    userId: users[4],
    action: 'VIEW',
    entityType: 'Asset',
    entityId: assets[5]._id,
    changes: {},
    timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
  });

  auditData.push({
    userId: users[5],
    action: 'LOGIN',
    entityType: 'User',
    entityId: users[5]._id,
    changes: { login: true },
    timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  });

  let auditCounter = 0;
  for (const data of auditData) {
    await AuditLog.create(data);
    auditCounter++;
  }

  console.log(`  Created ${auditCounter} audit log records`);
};

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Seed in order
    const users = await seedUsers();
    const categories = await seedCategories();
    const locations = await seedLocations();
    const assets = await seedAssets(categories, locations, users);
    await seedMaintenanceLogs(assets, users);
    await seedLifecycleTransactions(assets, users, locations);
    await seedAuditLogs(users, assets);

    console.log('\n✨ ===== SEED COMPLETE =====');
    console.log('\n🎯 System ready with demo data:');
    console.log(`  • ${users.length} users (admin, manager, technicians, users)`);
    console.log(`  • ${categories.length} asset categories`);
    console.log(`  • ${locations.length} physical locations`);
    console.log(`  • ${assets.length} assets with realistic depreciation`);
    console.log(`  • Maintenance logs for active assets`);
    console.log(`  • Lifecycle transactions for task flow (allocation, transfer, maintenance)`);
    console.log(`  • Activity audit trail (10+ entries)`);

    console.log('\n📖 Test Credentials:');
    console.log('  Admin       : admin@ffims.com / Admin@123456');
    console.log('  Manager     : manager@ffims.com / Manager@123456');
    console.log('  Technician  : technician@ffims.com / Tech@123456');
    console.log('  User        : user@ffims.com / User@123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

run();
