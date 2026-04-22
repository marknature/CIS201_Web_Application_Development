import Asset from '../models/Asset.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import AssetTransaction from '../models/AssetTransaction.js';

const normalizeCategoryName = (category) => {
  if (!category) return 'Uncategorized';
  if (typeof category === 'string') return category;
  return category.name || category.code || 'Uncategorized';
};

const normalizeLocationName = (location) => {
  if (!location) return 'General Operations';
  if (typeof location === 'string') return location;
  const parts = [location.building, location.floor ? `Floor ${location.floor}` : '', location.room ? `Room ${location.room}` : ''].filter(Boolean);
  return parts.join(' - ') || location.name || 'General Operations';
};

const getFunctionalUnit = (asset) => {
  const building = asset?.location?.building || normalizeLocationName(asset?.location);
  const category = normalizeCategoryName(asset?.category);

  if (/Administration Block/i.test(building)) {
    return 'Administration & Governance';
  }
  if (/Science Building/i.test(building) || /IT Equipment|Lab Equipment/i.test(category)) {
    return 'Science, ICT & Laboratories';
  }
  if (/Maintenance Facility/i.test(building) || /Vehicles|Machinery/i.test(category)) {
    return 'Transport & Maintenance';
  }
  if (/Central Library/i.test(building)) {
    return 'Library & Learning Services';
  }
  if (/Research Center/i.test(building)) {
    return 'Research & Innovation';
  }
  if (/Buildings|Furniture/i.test(category)) {
    return 'Campus Services';
  }
  return 'General Operations';
};

const normalizeStatus = (status) => String(status || 'unknown').toLowerCase();

const matchesText = (value, filterValue) => {
  if (!filterValue) return true;
  return String(value || '').toLowerCase().includes(String(filterValue).toLowerCase());
};

const matchesDateWindow = (dateValue, startDate, endDate) => {
  if (!startDate && !endDate) return true;
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  if (startDate && date < new Date(startDate)) return false;
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    if (date > end) return false;
  }
  return true;
};

const filterAssets = (assets, { category, status, startDate, endDate } = {}) => {
  return assets.filter((asset) => {
    const categoryName = normalizeCategoryName(asset.category);
    const assetStatus = normalizeStatus(asset.status);
    const categoryMatches = !category || matchesText(categoryName, category) || String(asset.category?._id || '').toLowerCase() === String(category).toLowerCase();
    const statusMatches = !status || assetStatus === String(status).toLowerCase();
    const dateMatches = matchesDateWindow(asset.purchaseDate, startDate, endDate);
    return categoryMatches && statusMatches && dateMatches;
  });
};

const buildAssetView = (asset) => {
  const cost = Number(asset.purchaseCost || 0);
  const currentValue = Number(asset.currentValue ?? cost);
  const salvageValue = Number(asset.salvageValue || 0);
  const usefulLife = Number(asset.usefulLife || 1);
  const annualDepreciation = usefulLife > 0 ? Number(((cost - salvageValue) / usefulLife).toFixed(2)) : 0;
  const depreciation = Number((cost - currentValue).toFixed(2));
  const monthlyDepreciation = Number((annualDepreciation / 12).toFixed(2));
  const projectedValue = Number(Math.max(salvageValue, currentValue - annualDepreciation).toFixed(2));

  return {
    assetId: asset._id,
    assetTag: asset.assetId,
    name: asset.name,
    category: normalizeCategoryName(asset.category),
    status: normalizeStatus(asset.status),
    location: normalizeLocationName(asset.location),
    unit: getFunctionalUnit(asset),
    purchaseDate: asset.purchaseDate,
    cost,
    salvageValue,
    currentValue,
    value: currentValue,
    depreciation,
    monthlyDepreciation,
    annualDepreciation,
    projectedValue,
    condition: asset.condition || '-',
  };
};

export const getReportSummary = async (req, res, next) => {
  try {
    const assets = await Asset.find().populate('category').populate('location');
    const views = assets.map(buildAssetView);

    res.json({
      success: true,
      data: {
        totalAssets: views.length,
        activeAssets: views.filter((asset) => asset.status === 'active').length,
        retiredAssets: views.filter((asset) => asset.status === 'retired').length,
        maintenanceAssets: views.filter((asset) => asset.status === 'maintenance').length,
        totalValue: views.reduce((sum, asset) => sum + asset.currentValue, 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssetSummaryReport = async (req, res, next) => {
  try {
    const rawAssets = await Asset.find().populate('category').populate('location');
    const assets = filterAssets(rawAssets, req.query).map(buildAssetView);

    const byCategoryMap = new Map();
    const byStatusMap = new Map();
    const byUnitMap = new Map();

    for (const asset of assets) {
      const categoryEntry = byCategoryMap.get(asset.category) || { category: asset.category, count: 0, totalValue: 0 };
      categoryEntry.count += 1;
      categoryEntry.totalValue += asset.currentValue;
      byCategoryMap.set(asset.category, categoryEntry);

      const statusEntry = byStatusMap.get(asset.status) || { status: asset.status, count: 0 };
      statusEntry.count += 1;
      byStatusMap.set(asset.status, statusEntry);

      const unitEntry = byUnitMap.get(asset.unit) || { unit: asset.unit, count: 0, totalValue: 0, maintenanceCount: 0 };
      unitEntry.count += 1;
      unitEntry.totalValue += asset.currentValue;
      if (asset.status === 'maintenance') unitEntry.maintenanceCount += 1;
      byUnitMap.set(asset.unit, unitEntry);
    }

    const topValued = assets
      .slice()
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 8);

    res.json({
      success: true,
      data: {
        byCategory: Array.from(byCategoryMap.values()).sort((a, b) => b.totalValue - a.totalValue),
        byStatus: Array.from(byStatusMap.values()).sort((a, b) => b.count - a.count),
        byUnit: Array.from(byUnitMap.values()).sort((a, b) => b.totalValue - a.totalValue),
        topValued,
        totalAssets: assets.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDepreciationReport = async (req, res, next) => {
  try {
    const rawAssets = await Asset.find().populate('category').populate('location');
    const assets = filterAssets(rawAssets, req.query).map(buildAssetView);

    const byCategoryMap = new Map();
    for (const asset of assets) {
      const entry = byCategoryMap.get(asset.category) || { category: asset.category, depreciation: 0, assetCount: 0, currentValue: 0, projectedValue: 0 };
      entry.depreciation += asset.depreciation;
      entry.assetCount += 1;
      entry.currentValue += asset.currentValue;
      entry.projectedValue += asset.projectedValue;
      byCategoryMap.set(asset.category, entry);
    }

    const highestDepreciation = assets
      .slice()
      .sort((a, b) => b.depreciation - a.depreciation)
      .slice(0, 8)
      .map((asset) => ({
        assetId: asset.assetId,
        name: asset.name,
        category: asset.category,
        originalValue: asset.cost,
        currentValue: asset.currentValue,
        depreciation: asset.depreciation,
      }));

    const projectedValues = assets
      .slice()
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 8)
      .map((asset) => ({
        assetId: asset.assetId,
        name: asset.name,
        category: asset.category,
        currentValue: asset.currentValue,
        projectedValue: asset.projectedValue,
        monthlyDepreciation: asset.monthlyDepreciation,
      }));

    res.json({
      success: true,
      data: {
        highestDepreciation,
        byCategory: Array.from(byCategoryMap.values()).sort((a, b) => b.depreciation - a.depreciation),
        projectedValues,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransferHistoryReport = async (req, res, next) => {
  try {
    const transfers = await AssetTransaction.find({ transactionType: 'transfer' })
      .populate({ path: 'assetId', populate: [{ path: 'category' }, { path: 'location' }] })
      .populate('fromLocation')
      .populate('toLocation')
      .sort({ timestamp: -1 });

    const filtered = transfers.filter((tx) => {
      const asset = tx.assetId;
      if (!asset) return false;
      return filterAssets([asset], req.query).length > 0 && matchesDateWindow(tx.timestamp, req.query.startDate, req.query.endDate);
    });

    res.json({
      success: true,
      data: filtered.map((tx) => ({
        id: tx._id,
        assetId: tx.assetId?._id,
        assetName: tx.assetId?.name || 'Unknown asset',
        category: normalizeCategoryName(tx.assetId?.category),
        fromLocation: normalizeLocationName(tx.fromLocation),
        toLocation: normalizeLocationName(tx.toLocation),
        transferDate: tx.timestamp,
        type: tx.transactionType,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceCostReport = async (req, res, next) => {
  try {
    const logs = await MaintenanceLog.find()
      .populate({ path: 'assetId', populate: [{ path: 'category' }, { path: 'location' }] })
      .sort({ nextMaintenanceDate: 1, maintenanceDate: -1 });

    const filteredLogs = logs.filter((log) => {
      const asset = log.assetId;
      if (!asset) return false;
      const assetMatches = filterAssets([asset], req.query).length > 0;
      const dateMatches = matchesDateWindow(log.nextMaintenanceDate || log.maintenanceDate, req.query.startDate, req.query.endDate);
      return assetMatches && dateMatches;
    });

    const now = new Date();
    const byCategoryMap = new Map();
    const upcoming = [];

    for (const log of filteredLogs) {
      const categoryName = normalizeCategoryName(log.assetId?.category);
      const cost = Number(log.cost || 0);
      const existing = byCategoryMap.get(categoryName) || { category: categoryName, totalCost: 0, serviceCount: 0, avgCost: 0 };
      existing.totalCost += cost;
      existing.serviceCount += 1;
      existing.avgCost = existing.serviceCount > 0 ? Number((existing.totalCost / existing.serviceCount).toFixed(2)) : 0;
      byCategoryMap.set(categoryName, existing);

      if (log.nextMaintenanceDate) {
        const dueDate = new Date(log.nextMaintenanceDate);
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        upcoming.push({
          id: log._id,
          assetId: log.assetId?._id,
          assetName: log.assetId?.name || 'Unknown asset',
          type: log.type,
          scheduledDate: dueDate,
          estimatedCost: cost,
          priority: daysUntil < 0 ? 'High' : daysUntil <= 7 ? 'High' : daysUntil <= 21 ? 'Medium' : 'Low',
          unit: getFunctionalUnit(log.assetId),
        });
      }
    }

    res.json({
      success: true,
      data: {
        totalCost: filteredLogs.reduce((sum, log) => sum + Number(log.cost || 0), 0),
        upcoming: upcoming.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate)).slice(0, 12),
        byCategory: Array.from(byCategoryMap.values()).sort((a, b) => b.totalCost - a.totalCost),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssetUtilizationReport = async (req, res, next) => {
  try {
    const transactions = await AssetTransaction.find()
      .populate({ path: 'assetId', populate: [{ path: 'category' }, { path: 'location' }] })
      .populate('fromLocation')
      .populate('toLocation')
      .sort({ timestamp: -1 });

    const filteredTransactions = transactions.filter((tx) => {
      const asset = tx.assetId;
      if (!asset) return false;
      const assetMatches = filterAssets([asset], req.query).length > 0;
      const dateMatches = matchesDateWindow(tx.timestamp, req.query.startDate, req.query.endDate);
      return assetMatches && dateMatches;
    });

    const usageMap = new Map();
    for (const tx of filteredTransactions) {
      const asset = tx.assetId;
      const key = String(asset._id);
      const existing = usageMap.get(key) || {
        assetId: asset._id,
        name: asset.name,
        category: normalizeCategoryName(asset.category),
        usageCount: 0,
        lastUsed: tx.timestamp,
      };
      existing.usageCount += 1;
      if (!existing.lastUsed || new Date(tx.timestamp) > new Date(existing.lastUsed)) {
        existing.lastUsed = tx.timestamp;
      }
      usageMap.set(key, existing);
    }

    const usage = Array.from(usageMap.values()).sort((a, b) => b.usageCount - a.usageCount || new Date(b.lastUsed) - new Date(a.lastUsed));

    res.json({
      success: true,
      data: {
        mostUsed: usage.slice(0, 6),
        leastUsed: usage.slice().reverse().slice(0, 6),
        transferHistory: filteredTransactions
          .filter((tx) => tx.transactionType === 'transfer')
          .slice(0, 12)
          .map((tx) => ({
            id: tx._id,
            assetId: tx.assetId?._id,
            assetName: tx.assetId?.name || 'Unknown asset',
            fromLocation: normalizeLocationName(tx.fromLocation),
            toLocation: normalizeLocationName(tx.toLocation),
            transferDate: tx.timestamp,
            type: tx.transactionType,
          })),
      },
    });
  } catch (error) {
    next(error);
  }
};
