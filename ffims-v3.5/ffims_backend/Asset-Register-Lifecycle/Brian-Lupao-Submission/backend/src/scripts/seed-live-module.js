import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Asset from '../models/Asset.js';
import '../models/AssetCategory.js';
import AssetLocation from '../models/AssetLocation.js';
import AssetDocument from '../models/AssetDocument.js';
import Valuation from '../models/Valuation.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(backendRoot, '.env'),
];

const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));
dotenv.config(envPath ? { path: envPath } : undefined);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ffims';
const uploadsDir = path.resolve(backendRoot, 'uploads');

const usefulLifeByCategory = {
  Vehicles: 10,
  'IT Equipment': 5,
  Furniture: 8,
  Machinery: 12,
  Buildings: 25,
  'Lab Equipment': 7,
};

const documentTypeByCategory = {
  Vehicles: 'warranty',
  'IT Equipment': 'manual',
  Furniture: 'invoice',
  Machinery: 'certificate',
  Buildings: 'contract',
  'Lab Equipment': 'report',
};

const buildingByAssetId = {
  'VEH-001': 'Maintenance Facility',
  'VEH-002': 'Maintenance Facility',
  'VEH-003': 'Maintenance Facility',
  'IT-001': 'Science Building',
  'IT-002': 'Science Building',
  'IT-003': 'Administration Block',
  'FUR-001': 'Administration Block',
  'FUR-002': 'Administration Block',
  'MAC-001': 'Maintenance Facility',
  'MAC-002': 'Maintenance Facility',
  'LAB-001': 'Research Center',
  'LAB-002': 'Research Center',
  'LAB-004': 'Research Center',
};

const presentationOverrides = {
  'LAB-004': {
    name: 'Analytical Balance Station',
    description: 'Precision weighing station for laboratory analysis and calibration work',
    purchaseCost: 16000,
    purchaseDate: new Date('2023-02-20'),
    depreciationRate: 10,
    status: 'active',
    condition: 'Good',
  },
};

const pdfText = (title, body) => `%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 91 >>
stream
BT
/F1 12 Tf
30 160 Td
(${title}) Tj
0 -24 Td
(${body}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000063 00000 n 
0000000122 00000 n 
0000000249 00000 n 
0000000390 00000 n 
trailer
<< /Root 1 0 R /Size 6 >>
startxref
460
%%EOF`;

const ensurePdf = (fileName, title, body) => {
  fs.mkdirSync(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, pdfText(title.replace(/[()]/g, ''), body.replace(/[()]/g, '')));
  const stat = fs.statSync(filePath);
  return { filePath, size: stat.size };
};

const getUsefulLife = (categoryName) => usefulLifeByCategory[categoryName] || 6;

const calculateCurrentValue = (asset, usefulLife, salvageValue) => {
  const cost = Number(asset.purchaseCost || 0);
  if (cost <= 0) return 0;
  const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate) : new Date();
  const yearsElapsed = Math.max(0, Math.floor((Date.now() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
  const annualDep = (cost - salvageValue) / usefulLife;
  return Math.max(salvageValue, Number((cost - annualDep * yearsElapsed).toFixed(2)));
};

const buildHistory = (cost, salvageValue, usefulLife, currentValue, purchaseDate) => {
  const annualDep = usefulLife > 0 ? (cost - salvageValue) / usefulLife : 0;
  const years = Math.max(1, Math.min(usefulLife, 5));
  const rows = [];
  for (let year = 1; year <= years; year += 1) {
    const depreciationAmount = Number(annualDep.toFixed(2));
    const bookValue = Math.max(salvageValue, Number((cost - annualDep * year).toFixed(2)));
    rows.push({
      year,
      depreciationAmount,
      bookValue,
      date: new Date(new Date(purchaseDate || Date.now()).getFullYear() + year, 0, 1),
    });
  }
  if (!rows.length) {
    rows.push({ year: 1, depreciationAmount: Number((cost - currentValue).toFixed(2)), bookValue: currentValue, date: new Date() });
  }
  return rows;
};

const run = async () => {
  await mongoose.connect(MONGODB_URI);
  const [assets, users, locations] = await Promise.all([
    Asset.find().populate('category'),
    User.find().sort({ createdAt: 1 }),
    AssetLocation.find(),
  ]);

  const fallbackUploader = users.find((user) => user.role === 'asset-manager') || users[0];
  const locationMap = new Map(locations.map((location) => [location.building, location]));

  let updatedAssets = 0;
  let seededValuations = 0;
  let seededDocuments = 0;

  for (const asset of assets) {
    const override = presentationOverrides[asset.assetId] || (asset.name === 'Chat' ? presentationOverrides['LAB-004'] : null);
    let assetChanged = false;

    if (override) {
      for (const [key, value] of Object.entries(override)) {
        if (String(asset[key] ?? '') !== String(value ?? '')) {
          asset[key] = value;
          assetChanged = true;
        }
      }
    }

    const targetBuilding = buildingByAssetId[asset.assetId];
    const targetLocation = targetBuilding ? locationMap.get(targetBuilding) : null;
    if (targetLocation && String(asset.location || '') !== String(targetLocation._id)) {
      asset.location = targetLocation._id;
      assetChanged = true;
    }

    const categoryName = asset.category?.name || 'General';
    const usefulLife = Number(asset.usefulLife || getUsefulLife(categoryName));
    const salvageValue = Number(asset.salvageValue || Number((asset.purchaseCost || 0) * 0.1).toFixed(2));
    const currentValue = calculateCurrentValue(asset, usefulLife, salvageValue);

    if (!asset.usefulLife || asset.usefulLife !== usefulLife) {
      asset.usefulLife = usefulLife;
      assetChanged = true;
    }
    if (asset.salvageValue == null || Number(asset.salvageValue) !== salvageValue) {
      asset.salvageValue = salvageValue;
      assetChanged = true;
    }
    if (Number(asset.currentValue || 0) !== currentValue) {
      asset.currentValue = currentValue;
      assetChanged = true;
    }

    if (assetChanged) {
      await asset.save();
      updatedAssets += 1;
    }

    const calculationHistory = buildHistory(asset.purchaseCost || 0, salvageValue, usefulLife, currentValue, asset.purchaseDate);
    await Valuation.findOneAndUpdate(
      { assetId: asset._id },
      {
        assetId: asset._id,
        originalCost: asset.purchaseCost || 0,
        purchaseDate: asset.purchaseDate,
        depreciationMethod: 'straight-line',
        depreciationRate: asset.depreciationRate || 0,
        salvageValue,
        estimatedLife: usefulLife,
        calculationHistory,
        currentValue,
        accumulatedDepreciation: Number(((asset.purchaseCost || 0) - currentValue).toFixed(2)),
        lastRevalued: new Date(),
        revaluedValue: currentValue,
        insuranceValue: asset.purchaseCost || 0,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    seededValuations += 1;

    const docType = documentTypeByCategory[categoryName] || 'general';
    const safeAssetName = String(asset.name || asset.assetId || 'asset').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const originalName = `${safeAssetName}-${docType}.pdf`;
    const storedName = `${asset.assetId || asset._id}-${docType}.pdf`;
    const { filePath, size } = ensurePdf(
      storedName,
      `${asset.name} ${docType}`,
      `Africa University Fleet and Facilities reference document for ${asset.name}`
    );

    const existingDocument = await AssetDocument.findOne({ assetId: asset._id, documentType: docType });
    if (!existingDocument) {
      await AssetDocument.create({
        assetId: asset._id,
        filename: storedName,
        originalName,
        path: filePath,
        size,
        mimeType: 'application/pdf',
        description: `${docType} record for ${asset.name}`,
        documentType: docType,
        uploadedBy: fallbackUploader?._id,
        uploadedAt: new Date(),
        status: 'active',
      });
      seededDocuments += 1;
    } else {
      existingDocument.filename = storedName;
      existingDocument.originalName = originalName;
      existingDocument.path = filePath;
      existingDocument.size = size;
      existingDocument.mimeType = 'application/pdf';
      existingDocument.description = `${docType} record for ${asset.name}`;
      existingDocument.uploadedBy = existingDocument.uploadedBy || fallbackUploader?._id;
      existingDocument.status = 'active';
      await existingDocument.save();
    }
  }

  console.log(`Updated assets: ${updatedAssets}`);
  console.log(`Valuations upserted: ${seededValuations}`);
  console.log(`Documents created: ${seededDocuments}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Live module seeding failed:', error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});