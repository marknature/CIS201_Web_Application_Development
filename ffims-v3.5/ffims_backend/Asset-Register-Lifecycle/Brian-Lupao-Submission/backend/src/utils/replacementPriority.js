import AssetDocument from '../models/AssetDocument.js';

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const round = (value, digits = 1) => Number(Number(value || 0).toFixed(digits));

const toMapCount = (items, keySelector) => items.reduce((acc, item) => {
  const key = keySelector(item);
  if (!key) return acc;
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const yearsBetween = (date, now = new Date()) => {
  if (!date) return 0;
  const start = new Date(date);
  if (Number.isNaN(start.getTime())) return 0;
  const ms = now.getTime() - start.getTime();
  return Math.max(0, ms / (1000 * 60 * 60 * 24 * 365.25));
};

const getPriority = (score) => {
  if (score >= 70) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
};

const getAction = (priority) => {
  if (priority === 'Critical') return 'Replace or overhaul this budget cycle';
  if (priority === 'High') return 'Prioritize for capital review';
  if (priority === 'Medium') return 'Repair and monitor closely';
  return 'Monitor through routine review';
};

const getPriorityTone = (priority) => {
  if (priority === 'Critical') return 'danger';
  if (priority === 'High') return 'warning';
  if (priority === 'Medium') return 'primary';
  return 'success';
};

export const buildReplacementPriorityData = async ({ assets = [], maintenanceLogs = [], now = new Date() } = {}) => {
  const activeDocuments = await AssetDocument.find({
    assetId: { $in: assets.map((asset) => asset._id) },
    status: 'active',
  }).lean();

  const maintenanceByAsset = toMapCount(maintenanceLogs, (log) => log?.assetId?._id?.toString?.() || log?.assetId?.toString?.());
  const overdueByAsset = toMapCount(
    maintenanceLogs.filter((log) => log?.nextMaintenanceDate && new Date(log.nextMaintenanceDate) < now),
    (log) => log?.assetId?._id?.toString?.() || log?.assetId?.toString?.()
  );
  const documentByAsset = toMapCount(activeDocuments, (doc) => doc?.assetId?.toString?.());

  const replacementPriorities = assets.map((asset) => {
    const assetKey = asset._id?.toString();
    const purchaseCost = Number(asset.purchaseCost || 0);
    const currentValue = Number(asset.currentValue || asset.purchaseCost || 0);
    const usefulLife = Number(asset.usefulLife || 0);
    const depreciationRate = Number(asset.depreciationRate || 0);
    const ageYears = yearsBetween(asset.purchaseDate, now);
    const lifecyclePressure = usefulLife > 0 ? clamp(ageYears / usefulLife, 0, 2) : 0;
    const valueDropRatio = purchaseCost > 0 ? clamp((purchaseCost - currentValue) / purchaseCost, 0, 1.5) : 0;
    const maintenanceCount = maintenanceByAsset[assetKey] || 0;
    const overdueCount = overdueByAsset[assetKey] || 0;
    const documentCount = documentByAsset[assetKey] || 0;
    const condition = String(asset.condition || '').toLowerCase();

    const factors = {
      lifecycle: clamp(lifecyclePressure * 25, 0, 25),
      valueLoss: clamp(valueDropRatio * 25, 0, 25),
      maintenance: clamp(maintenanceCount * 5, 0, 20),
      overdue: clamp(overdueCount * 7, 0, 14),
      status: asset.status === 'retired' ? 20 : asset.status === 'maintenance' ? 10 : 0,
      condition: condition === 'poor' ? 10 : condition === 'fair' ? 5 : 0,
      evidenceGap: documentCount === 0 ? 6 : documentCount === 1 ? 3 : 0,
      depreciationPressure: depreciationRate >= 25 ? 5 : depreciationRate >= 15 ? 3 : 0,
    };

    const score = round(Object.values(factors).reduce((sum, value) => sum + value, 0), 0);
    const priority = getPriority(score);

    const reasons = [];
    if (lifecyclePressure >= 1) reasons.push(`Asset age is at or beyond useful life (${round(ageYears)}y/${usefulLife || '-'}y).`);
    else if (lifecyclePressure >= 0.75) reasons.push(`Asset age is nearing useful life (${round(ageYears)}y/${usefulLife || '-'}y).`);
    if (valueDropRatio >= 0.5) reasons.push(`Value has dropped by ${round(valueDropRatio * 100, 0)}% from acquisition cost.`);
    else if (valueDropRatio >= 0.35) reasons.push(`Value erosion is material at ${round(valueDropRatio * 100, 0)}%.`);
    if (maintenanceCount >= 3) reasons.push(`${maintenanceCount} maintenance event(s) recorded, showing repeat service demand.`);
    else if (maintenanceCount > 0) reasons.push(`${maintenanceCount} maintenance event(s) recorded for this asset.`);
    if (overdueCount > 0) reasons.push(`${overdueCount} overdue maintenance item(s) still need action.`);
    if (asset.status === 'maintenance') reasons.push('Asset is currently marked in maintenance.');
    if (asset.status === 'retired') reasons.push('Asset is already marked retired and should exit active planning.');
    if (condition === 'poor' || condition === 'fair') reasons.push(`Condition is recorded as ${condition}.`);
    if (documentCount === 0) reasons.push('No active supporting documents are attached.');
    else if (documentCount === 1) reasons.push('Only one supporting document is attached; evidence coverage is thin.');
    if (reasons.length === 0) reasons.push('No major replacement drivers detected; continue monitoring.');

    return {
      id: asset._id,
      assetId: asset.assetId,
      name: asset.name,
      category: asset.category?.name || asset.category || 'Uncategorized',
      location: asset.location?.building || asset.location?.name || asset.location || 'General Operations',
      status: asset.status || 'unknown',
      condition: asset.condition || 'Not recorded',
      score,
      priority,
      priorityTone: getPriorityTone(priority),
      recommendedAction: getAction(priority),
      ageYears: round(ageYears),
      usefulLife,
      purchaseCost,
      currentValue,
      valueDropPercent: round(valueDropRatio * 100, 0),
      maintenanceCount,
      overdueCount,
      documentCount,
      reasons: reasons.slice(0, 3),
      factorBreakdown: Object.fromEntries(Object.entries(factors).map(([key, value]) => [key, round(value, 0)])),
    };
  }).sort((a, b) => b.score - a.score || b.purchaseCost - a.purchaseCost);

  const criticalCount = replacementPriorities.filter((asset) => asset.priority === 'Critical').length;
  const highCount = replacementPriorities.filter((asset) => asset.priority === 'High').length;
  const mediumCount = replacementPriorities.filter((asset) => asset.priority === 'Medium').length;
  const capitalReviewCount = replacementPriorities.filter((asset) => asset.score >= 50).length;
  const capitalExposure = replacementPriorities
    .filter((asset) => asset.score >= 50)
    .reduce((sum, asset) => sum + Number(asset.currentValue || 0), 0);

  return {
    replacementPriorities: replacementPriorities.slice(0, 6),
    capitalPlanningSummary: {
      criticalCount,
      highCount,
      mediumCount,
      capitalReviewCount,
      capitalExposure,
      averageScore: replacementPriorities.length
        ? round(replacementPriorities.reduce((sum, asset) => sum + asset.score, 0) / replacementPriorities.length, 0)
        : 0,
    },
    topPriorityAsset: replacementPriorities[0] || null,
  };
};
