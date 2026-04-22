import Asset from '../models/Asset.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import { buildReplacementPriorityData } from '../utils/replacementPriority.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const assets = await Asset.find().populate('category').populate('location').populate('custodian');
    const totalAssets = assets.length;

    const statusCounts = assets.reduce(
      (acc, asset) => {
        const status = asset.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { active: 0, maintenance: 0, retired: 0, unknown: 0 }
    );

    const totalValue = assets.reduce((sum, asset) => sum + (asset.currentValue || asset.purchaseCost || 0), 0);
    const totalCost = assets.reduce((sum, asset) => sum + (asset.purchaseCost || 0), 0);

    const avgDepreciationRate = assets.length
      ? Number((assets.reduce((sum, asset) => sum + (asset.depreciationRate || 0), 0) / assets.length).toFixed(2))
      : 0;

    const categoryBreakdown = Object.values(
      assets.reduce((acc, asset) => {
        const categoryName = asset.category?.name || 'Uncategorized';
        if (!acc[categoryName]) acc[categoryName] = { category: categoryName, count: 0, value: 0 };
        acc[categoryName].count += 1;
        acc[categoryName].value += asset.currentValue || asset.purchaseCost || 0;
        return acc;
      }, {})
    ).sort((a, b) => b.value - a.value);

    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(now.getDate() + 7);

    const maintenanceLogs = await MaintenanceLog.find({ nextMaintenanceDate: { $exists: true, $ne: null } })
      .populate('assetId', 'name status location category')
      .sort({ nextMaintenanceDate: 1 });

    const upcomingMaintenance = maintenanceLogs
      .filter((log) => log.nextMaintenanceDate && new Date(log.nextMaintenanceDate) >= now && new Date(log.nextMaintenanceDate) <= weekFromNow)
      .slice(0, 5)
      .map((log) => ({
        id: log._id,
        assetId: log.assetId?._id,
        assetName: log.assetId?.name || 'Unknown Asset',
        dueDate: log.nextMaintenanceDate,
        type: log.type,
      }));

    const maintenanceDueSoon = upcomingMaintenance.length;
    const overdueMaintenance = maintenanceLogs.filter((log) => log.nextMaintenanceDate && new Date(log.nextMaintenanceDate) < now).length;

    const depreciationAlerts = assets
      .filter((asset) => {
        const current = asset.currentValue || asset.purchaseCost || 0;
        const original = asset.purchaseCost || 0;
        if (original <= 0) return false;
        const drop = (original - current) / original;
        return drop >= 0.35;
      })
      .map((asset) => ({
        id: asset._id,
        name: asset.name,
        currentValue: asset.currentValue || asset.purchaseCost || 0,
      }));

    const {
      replacementPriorities,
      capitalPlanningSummary,
      topPriorityAsset,
    } = await buildReplacementPriorityData({ assets, maintenanceLogs, now });

    const aiInsights = [];
    if (totalAssets === 0) {
      aiInsights.push('No assets are in the register yet. Add assets to unlock automated operational insights.');
    } else {
      if (statusCounts.maintenance >= Math.max(1, Math.ceil(totalAssets * 0.15))) {
        aiInsights.push(`High maintenance workload: ${statusCounts.maintenance} asset(s) are currently in maintenance. Prioritize triage and resource allocation.`);
      } else {
        aiInsights.push(`Maintenance load is moderate. ${statusCounts.maintenance} assets are in maintenance.`);
      }

      if (overdueMaintenance > 0) {
        aiInsights.push(`Alert: ${overdueMaintenance} maintenance task(s) are overdue. This should be escalated before service disruption grows.`);
      }

      if (depreciationAlerts.length > 0) {
        aiInsights.push(`Depreciation risk: ${depreciationAlerts.length} asset(s) have reduced by 35% or more in value; review replacement or revaluation planning.`);
      } else {
        aiInsights.push('Depreciation risk is currently low across your portfolio. Continue periodic review.');
      }

      if (capitalPlanningSummary.criticalCount > 0) {
        aiInsights.push(`Capital planning signal: ${capitalPlanningSummary.criticalCount} asset(s) are now ranked critical for replacement or overhaul.`);
      } else if (capitalPlanningSummary.capitalReviewCount > 0) {
        aiInsights.push(`Capital review watchlist: ${capitalPlanningSummary.capitalReviewCount} asset(s) should be reviewed in the next budgeting cycle.`);
      }

      if (topPriorityAsset) {
        aiInsights.push(`Top priority asset: ${topPriorityAsset.name} is ranked ${topPriorityAsset.priority.toLowerCase()} due to ${topPriorityAsset.reasons[0].toLowerCase()}`);
      }

      if (totalValue < totalCost * 0.65) {
        aiInsights.push('Current total asset value is substantially lower than acquisition cost; verify depreciation methodology and update records.');
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        totalAssets,
        statusCounts,
        totalCost,
        totalValue,
        avgDepreciationRate,
        categoryBreakdown,
        maintenanceDueSoon,
        overdueMaintenance,
        upcomingMaintenance,
        depreciationAlerts,
        replacementPriorities,
        capitalPlanningSummary,
        aiInsights,
      },
    });
  } catch (error) {
    next(error);
  }
};
