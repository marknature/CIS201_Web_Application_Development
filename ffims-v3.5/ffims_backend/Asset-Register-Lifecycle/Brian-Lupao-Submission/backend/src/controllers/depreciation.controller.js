import Asset from '../models/Asset.js';
import AssetCategory from '../models/AssetCategory.js';
import AuditLog from '../models/AuditLog.js';

const VALID_METHODS = ['straight-line', 'declining-balance', 'sum-of-years-digits'];

const calculateStraightLine = (cost, salvage, usefulLife) => {
  return (cost - salvage) / usefulLife;
};

const calculateDecliningBalance = (bookValue, rate) => {
  return bookValue * (rate / 100);
};

const calculateSumOfYears = (cost, salvage, remainingLife, sumOfYears) => {
  return (cost - salvage) * (remainingLife / sumOfYears);
};

const getSumOfYears = (usefulLife) => {
  return (usefulLife * (usefulLife + 1)) / 2;
};

const logAudit = async (userId, action, details) => {
  try {
    await AuditLog.create({
      userId,
      action,
      details,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

export const getAllDepreciation = async (req, res, next) => {
  try {
    const assets = await Asset.find().populate('category');
    const depreciationData = assets.map(asset => {
      const cost = Number(asset.purchaseCost || 0);
      const salvage = Number(asset.salvageValue || 0);
      const currentValue = asset.currentValue != null ? Number(asset.currentValue) : cost;
      const accumulatedDepreciation = cost - currentValue;
      const usefulLife = Number(asset.usefulLife) > 0 ? Number(asset.usefulLife) : 1;
      const annualDepreciation = calculateStraightLine(cost, salvage, usefulLife);
      return {
        assetId: asset._id,
        name: asset.name,
        category: asset.category?.name || 'Uncategorized',
        cost,
        salvageValue: salvage,
        accumulatedDepreciation,
        currentValue,
        annualDepreciation,
        usefulLife,
        depreciationRate: Number(asset.depreciationRate || 0),
        purchaseDate: asset.purchaseDate,
      };
    });
    res.json({ success: true, data: depreciationData });
  } catch (error) {
    next(error);
  }
};

export const getAssetDepreciation = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    const asset = await Asset.findById(assetId).populate('category');
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const cost = Number(asset.purchaseCost || 0);
    const salvage = Number(asset.salvageValue || 0);
    const usefulLife = Number(asset.usefulLife) > 0 ? Number(asset.usefulLife) : 1;
    const currentValue = asset.currentValue != null ? Number(asset.currentValue) : cost;
    const accumulatedDepreciation = cost - currentValue;
    const annualDepreciation = calculateStraightLine(cost, salvage, usefulLife);
    const depreciationRate = Number(asset.depreciationRate || 0);

    const depreciation = {
      assetId: asset._id,
      name: asset.name,
      category: asset.category?.name || 'Uncategorized',
      cost,
      salvageValue: salvage,
      accumulatedDepreciation,
      currentValue,
      annualDepreciation,
      usefulLife,
      depreciationRate,
      purchaseDate: asset.purchaseDate,
      purchaseCost: asset.purchaseCost,
      currentBookValue: currentValue,
      percentDepreciated: cost > 0 ? ((accumulatedDepreciation / cost) * 100).toFixed(2) : 0,
    };
    res.json({ success: true, data: depreciation });
  } catch (error) {
    next(error);
  }
};

export const calculateDepreciation = async (req, res, next) => {
  try {
    const { assetId, method, rate, years, customValues } = req.body;

    if (assetId) {
      const asset = await Asset.findById(assetId);
      if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

      const cost = customValues?.cost ?? asset.purchaseCost ?? 0;
      const salvage = customValues?.salvage ?? asset.salvageValue ?? 0;
      const usefulLife = years || asset.usefulLife || 1;
      const depreciationRate = rate || asset.depreciationRate || 0;
      let depreciation = 0;
      let details = {};

      if (!VALID_METHODS.includes(method)) {
        return res.status(400).json({ success: false, message: 'Invalid depreciation method' });
      }

      switch (method) {
        case 'straight-line':
          depreciation = calculateStraightLine(cost, salvage, usefulLife);
          details = {
            formula: '(cost - salvage) / usefulLife',
            annualDepreciation: depreciation,
            totalDepreciation: depreciation * usefulLife,
          };
          break;
        case 'declining-balance':
          depreciation = calculateDecliningBalance(cost, depreciationRate);
          details = {
            formula: 'bookValue * (rate/100)',
            rate: depreciationRate,
            firstYearDepreciation: depreciation,
          };
          break;
        case 'sum-of-years-digits':
          const sumOfYears = getSumOfYears(usefulLife);
          depreciation = calculateSumOfYears(cost, salvage, usefulLife, sumOfYears);
          details = {
            formula: '(cost - salvage) * (remainingLife / sumOfYears)',
            sumOfYears,
            firstYearDepreciation: depreciation,
          };
          break;
      }

      res.json({ success: true, data: { depreciation, method, ...details } });
    } else {
      const { cost, salvage, usefulLife } = req.body;
      if (cost == null || salvage == null || usefulLife == null) {
        return res.status(400).json({ success: false, message: 'Missing required fields: cost, salvage, usefulLife' });
      }
      if (!VALID_METHODS.includes(method)) {
        return res.status(400).json({ success: false, message: 'Invalid depreciation method' });
      }

      let depreciation = 0;
      let details = {};

      switch (method) {
        case 'straight-line':
          depreciation = calculateStraightLine(cost, salvage, usefulLife);
          details = {
            formula: '(cost - salvage) / usefulLife',
            annualDepreciation: depreciation,
            totalDepreciation: depreciation * usefulLife,
          };
          break;
        case 'declining-balance':
          depreciation = calculateDecliningBalance(cost, rate || 0);
          details = {
            formula: 'bookValue * (rate/100)',
            rate: rate || 0,
            firstYearDepreciation: depreciation,
          };
          break;
        case 'sum-of-years-digits':
          const sumOfYears = getSumOfYears(usefulLife);
          depreciation = calculateSumOfYears(cost, salvage, usefulLife, sumOfYears);
          details = {
            formula: '(cost - salvage) * (remainingLife / sumOfYears)',
            sumOfYears,
            firstYearDepreciation: depreciation,
          };
          break;
      }

      res.json({ success: true, data: { depreciation, method, ...details } });
    }
  } catch (error) {
    next(error);
  }
};

export const generateDepreciationReport = async (req, res, next) => {
  try {
    const { startDate, endDate, categoryId } = req.query;
    const query = {};
    if (categoryId) query.category = categoryId;

    const assets = await Asset.find(query).populate('category');
    const reportDate = new Date();
    const totalAssets = assets.length;
    let totalCost = 0;
    let totalSalvage = 0;
    let totalCurrentValue = 0;
    let totalAccumulated = 0;

    const assetDetails = assets.map(asset => {
      const cost = asset.purchaseCost || 0;
      const salvage = asset.salvageValue || 0;
      const currentValue = asset.currentValue != null ? asset.currentValue : cost;
      const accumulated = cost - currentValue;
      const usefulLife = asset.usefulLife || 1;
      const annualDepreciation = calculateStraightLine(cost, salvage, usefulLife);

      totalCost += cost;
      totalSalvage += salvage;
      totalCurrentValue += currentValue;
      totalAccumulated += accumulated;

      return {
        assetId: asset._id,
        name: asset.name,
        category: asset.category?.name || 'Uncategorized',
        purchaseDate: asset.purchaseDate,
        cost,
        salvageValue: salvage,
        currentValue,
        accumulatedDepreciation: accumulated,
        annualDepreciation,
        usefulLife,
        remainingLife: Math.max(0, usefulLife - Math.floor(accumulated / (annualDepreciation || 1))),
      };
    });

    const report = {
      reportDate,
      period: { startDate, endDate },
      summary: {
        totalAssets,
        totalOriginalCost: totalCost,
        totalSalvageValue: totalSalvage,
        totalCurrentValue: totalCurrentValue,
        totalAccumulatedDepreciation: totalAccumulated,
        averageDepreciationPercent: totalCost > 0 ? ((totalAccumulated / totalCost) * 100).toFixed(2) : 0,
      },
      assets: assetDetails,
    };

    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

export const getDepreciationSummary = async (req, res, next) => {
  try {
    const assets = await Asset.find().populate('category');
    const categoryMap = new Map();

    assets.forEach(asset => {
      const categoryName = asset.category?.name || 'Uncategorized';
      const cost = asset.purchaseCost || 0;
      const salvage = asset.salvageValue || 0;
      const currentValue = asset.currentValue != null ? asset.currentValue : cost;
      const accumulated = cost - currentValue;

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          category: categoryName,
          assetCount: 0,
          totalCost: 0,
          totalSalvage: 0,
          totalCurrentValue: 0,
          totalAccumulatedDepreciation: 0,
        });
      }

      const summary = categoryMap.get(categoryName);
      summary.assetCount += 1;
      summary.totalCost += cost;
      summary.totalSalvage += salvage;
      summary.totalCurrentValue += currentValue;
      summary.totalAccumulatedDepreciation += accumulated;
    });

    const summaries = Array.from(categoryMap.values()).map(item => ({
      ...item,
      depreciationPercent: item.totalCost > 0 ? ((item.totalAccumulatedDepreciation / item.totalCost) * 100).toFixed(2) : 0,
    }));

    const overall = {
      totalAssets: assets.length,
      totalCost: summaries.reduce((sum, s) => sum + s.totalCost, 0),
      totalSalvage: summaries.reduce((sum, s) => sum + s.totalSalvage, 0),
      totalCurrentValue: summaries.reduce((sum, s) => sum + s.totalCurrentValue, 0),
      totalAccumulatedDepreciation: summaries.reduce((sum, s) => sum + s.totalAccumulatedDepreciation, 0),
    };
    overall.depreciationPercent = overall.totalCost > 0 ? ((overall.totalAccumulatedDepreciation / overall.totalCost) * 100).toFixed(2) : 0;

    res.json({ success: true, data: { categories: summaries, overall } });
  } catch (error) {
    next(error);
  }
};

export const updateAssetValue = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    const { currentValue, depreciationMethod, rate, years } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const cost = asset.purchaseCost || 0;
    const salvage = asset.salvageValue || 0;
    const usefulLife = asset.usefulLife || 1;
    const depreciationRate = rate || asset.depreciationRate || 0;

    let newValue;
    if (currentValue !== undefined) {
      newValue = Math.max(0, Math.min(currentValue, cost));
    } else if (depreciationMethod) {
      let depreciation = 0;
      switch (depreciationMethod) {
        case 'straight-line':
          depreciation = calculateStraightLine(cost, salvage, usefulLife);
          newValue = Math.max(salvage, cost - depreciation);
          break;
        case 'declining-balance':
          depreciation = calculateDecliningBalance(cost, depreciationRate);
          newValue = Math.max(salvage, cost - depreciation);
          break;
        case 'sum-of-years-digits':
          const sumOfYears = getSumOfYears(usefulLife);
          depreciation = calculateSumOfYears(cost, salvage, usefulLife, sumOfYears);
          newValue = Math.max(salvage, cost - depreciation);
          break;
        default:
          return res.status(400).json({ success: false, message: 'Invalid depreciation method' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Provide currentValue or depreciationMethod' });
    }

    const oldValue = asset.currentValue != null ? asset.currentValue : cost;
    asset.currentValue = newValue;
    await asset.save();

    await logAudit(req.user?.id, 'UPDATE_ASSET_VALUE', {
      assetId,
      assetName: asset.name,
      oldValue,
      newValue,
      depreciationMethod,
    });

    res.json({
      success: true,
      data: {
        assetId: asset._id,
        name: asset.name,
        oldValue,
        newValue,
        depreciationApplied: oldValue - newValue,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forecastDepreciation = async (req, res, next) => {
  try {
    const { assetId, years: forecastYears } = req.body;

    if (!assetId) {
      return res.status(400).json({ success: false, message: 'assetId is required' });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const cost = asset.purchaseCost || 0;
    const salvage = asset.salvageValue || 0;
    const usefulLife = asset.usefulLife || 1;
    const depreciationRate = asset.depreciationRate || 0;
    const currentValue = asset.currentValue != null ? asset.currentValue : cost;

    const years = forecastYears || usefulLife;
    const forecast = [];
    let bookValue = currentValue;

    for (let year = 1; year <= years; bookValue = Math.max(salvage, bookValue), year++) {
      const straightLine = calculateStraightLine(cost, salvage, usefulLife);
      const decliningBalance = calculateDecliningBalance(bookValue, depreciationRate);
      const sumOfYears = getSumOfYears(usefulLife);
      const sydDepreciation = calculateSumOfYears(cost, salvage, usefulLife - year + 1, sumOfYears);

      forecast.push({
        year,
        straightLine: { depreciation: straightLine, bookValue: Math.max(salvage, bookValue - straightLine) },
        decliningBalance: { depreciation: Math.min(decliningBalance, bookValue - salvage), bookValue: Math.max(salvage, bookValue - decliningBalance) },
        sumOfYearsDigits: { depreciation: Math.min(sydDepreciation, bookValue - salvage), bookValue: Math.max(salvage, bookValue - sydDepreciation) },
      });
    }

    res.json({
      success: true,
      data: {
        assetId: asset._id,
        name: asset.name,
        currentValue,
        cost,
        salvageValue: salvage,
        usefulLife,
        forecastYears: years,
        forecast,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDepreciationByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const query = categoryId ? { category: categoryId } : {};

    const assets = await Asset.find(query).populate('category');
    const categoryMap = new Map();

    assets.forEach(asset => {
      const categoryName = asset.category?.name || 'Uncategorized';
      const categoryIdVal = asset.category?._id?.toString() || 'uncategorized';
      const cost = asset.purchaseCost || 0;
      const salvage = asset.salvageValue || 0;
      const currentValue = asset.currentValue != null ? asset.currentValue : cost;
      const accumulated = cost - currentValue;
      const usefulLife = asset.usefulLife || 1;
      const annualDepreciation = calculateStraightLine(cost, salvage, usefulLife);

      if (!categoryMap.has(categoryIdVal)) {
        categoryMap.set(categoryIdVal, {
          categoryId: categoryIdVal,
          categoryName,
          assets: [],
          totalCost: 0,
          totalSalvage: 0,
          totalCurrentValue: 0,
          totalAccumulatedDepreciation: 0,
          totalAnnualDepreciation: 0,
        });
      }

      const group = categoryMap.get(categoryIdVal);
      group.assets.push({
        assetId: asset._id,
        name: asset.name,
        cost,
        salvageValue: salvage,
        currentValue,
        accumulatedDepreciation: accumulated,
        annualDepreciation,
        usefulLife,
      });
      group.totalCost += cost;
      group.totalSalvage += salvage;
      group.totalCurrentValue += currentValue;
      group.totalAccumulatedDepreciation += accumulated;
      group.totalAnnualDepreciation += annualDepreciation;
    });

    const groupedData = Array.from(categoryMap.values()).map(group => ({
      ...group,
      depreciationPercent: group.totalCost > 0 ? ((group.totalAccumulatedDepreciation / group.totalCost) * 100).toFixed(2) : 0,
    }));

    res.json({ success: true, data: groupedData });
  } catch (error) {
    next(error);
  }
};
