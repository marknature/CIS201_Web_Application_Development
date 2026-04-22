import Groq from 'groq-sdk';
import Asset from '../models/Asset.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import { buildReplacementPriorityData } from '../utils/replacementPriority.js';

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const MODEL = process.env.AI_MODEL || 'llama-3.3-70b-versatile';

const buildSystemPrompt = (context = {}) => {
  const metrics = context?.visibleMetrics || {};
  const insights = Array.isArray(context?.aiInsights) ? context.aiInsights.slice(0, 4).join(' | ') : '';
  const planning = context?.capitalPlanningSummary || {};
  const topAsset = context?.replacementPriorities?.[0];

  return [
    'You are FFIMS AI Analyst. Provide concise, actionable asset insights for the Africa University Fleet & Facilities Manager.',
    `Role: ${context?.role || 'user'}.`,
    `Total assets: ${metrics.totalAssets ?? 0}. Active: ${metrics.activeAssets ?? 0}. Maintenance: ${metrics.maintenanceAssets ?? 0}. Overdue: ${metrics.overdueMaintenance ?? 0}.`,
    `Depreciation alerts: ${metrics.depreciationAlerts ?? 0}. Capital review candidates: ${planning.capitalReviewCount ?? 0}. Critical replacement candidates: ${planning.criticalCount ?? 0}.`,
    topAsset ? `Top replacement priority: ${topAsset.name} (${topAsset.priority}) because ${topAsset.reasons?.[0] || 'it carries the highest combined risk score'}.` : 'Top replacement priority: none available.',
    insights ? `Current insights: ${insights}` : 'Current insights: none available.',
    'If data is missing, ask a short clarifying question.'
  ].join('\n');
};

const buildLiveContext = async (context = {}) => {
  const providedMetrics = context?.visibleMetrics || {};
  const hasProvidedMetrics = Object.values(providedMetrics).some((value) => Number(value || 0) > 0);
  const hasProvidedPlanning = Array.isArray(context?.replacementPriorities) && context.replacementPriorities.length > 0;

  if (hasProvidedMetrics && hasProvidedPlanning) {
    return context;
  }

  const assets = await Asset.find().populate('category').populate('location').lean();
  const totalAssets = assets.length;
  const statusCounts = assets.reduce(
    (acc, asset) => {
      const status = asset.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { active: 0, maintenance: 0, retired: 0, unknown: 0 }
  );

  const now = new Date();
  const maintenanceLogs = await MaintenanceLog.find({ nextMaintenanceDate: { $exists: true, $ne: null } }).lean();
  const overdueMaintenance = maintenanceLogs.filter((log) => log.nextMaintenanceDate && new Date(log.nextMaintenanceDate) < now).length;

  const depreciationAlerts = assets.filter((asset) => {
    const original = Number(asset.purchaseCost || 0);
    const current = Number(asset.currentValue || asset.purchaseCost || 0);
    if (original <= 0) return false;
    return ((original - current) / original) >= 0.35;
  }).length;

  const {
    replacementPriorities,
    capitalPlanningSummary,
  } = await buildReplacementPriorityData({ assets, maintenanceLogs, now });

  const aiInsights = [];
  if (totalAssets === 0) {
    aiInsights.push('No assets are in the register yet. Add assets to unlock automated operational insights.');
  } else {
    aiInsights.push(`Asset register currently tracks ${totalAssets} asset(s) across fleet and facilities operations.`);
    if (statusCounts.maintenance > 0) {
      aiInsights.push(`${statusCounts.maintenance} asset(s) are currently in maintenance.`);
    }
    if (overdueMaintenance > 0) {
      aiInsights.push(`${overdueMaintenance} maintenance task(s) are overdue and need escalation.`);
    }
    if (depreciationAlerts > 0) {
      aiInsights.push(`${depreciationAlerts} asset(s) have dropped by 35% or more in value.`);
    }
    if (capitalPlanningSummary.criticalCount > 0) {
      aiInsights.push(`${capitalPlanningSummary.criticalCount} asset(s) are ranked critical for replacement or overhaul.`);
    } else if (capitalPlanningSummary.capitalReviewCount > 0) {
      aiInsights.push(`${capitalPlanningSummary.capitalReviewCount} asset(s) should be reviewed in the next capital planning cycle.`);
    }
  }

  return {
    ...context,
    visibleMetrics: {
      totalAssets,
      activeAssets: statusCounts.active || 0,
      maintenanceAssets: statusCounts.maintenance || 0,
      overdueMaintenance,
      depreciationAlerts,
    },
    capitalPlanningSummary,
    replacementPriorities,
    aiInsights,
  };
};

const fallbackReply = (context = {}) => {
  const metrics = context?.visibleMetrics || {};
  const planning = context?.capitalPlanningSummary || {};
  const topAsset = context?.replacementPriorities?.[0];
  const insights = Array.isArray(context?.aiInsights) ? context.aiInsights.slice(0, 2).join(' ') : '';
  const summary = `AI is offline. Summary: Total assets ${metrics.totalAssets ?? 0}, Active ${metrics.activeAssets ?? 0}, Maintenance ${metrics.maintenanceAssets ?? 0}, Overdue ${metrics.overdueMaintenance ?? 0}, Depreciation alerts ${metrics.depreciationAlerts ?? 0}, Capital review candidates ${planning.capitalReviewCount ?? 0}.`;
  const planningNote = topAsset ? ` Top priority asset: ${topAsset.name} (${topAsset.priority}) - ${topAsset.reasons?.[0] || topAsset.recommendedAction}.` : '';
  return `${summary}${planningNote}${insights ? ` ${insights}` : ''}`.trim();
};

export const chatSend = async (req, res) => {
  try {
    const { message, context = {} } = req.body || {};
    const enrichedContext = await buildLiveContext(context);

    if (!groq) {
      return res.json({ reply: fallbackReply(enrichedContext), provider: 'offline', context: enrichedContext });
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: buildSystemPrompt(enrichedContext) },
        { role: 'user', content: message || 'Summarize current asset health.' }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const reply = completion.choices?.[0]?.message?.content || fallbackReply(enrichedContext);
    return res.json({ reply, provider: 'groq', model: MODEL, context: enrichedContext });
  } catch (err) {
    const enrichedContext = await buildLiveContext(req.body?.context || {}).catch(() => req.body?.context || {});
    return res.json({ reply: fallbackReply(enrichedContext), provider: 'offline', error: 'AI unavailable', context: enrichedContext });
  }
};

export const chatStream = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { message, context = {} } = req.body || {};
  const sendEvent = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  let enrichedContext = context;
  try {
    enrichedContext = await buildLiveContext(context);
  } catch {
    enrichedContext = context;
  }

  if (!groq) {
    sendEvent({ type: 'text', delta: fallbackReply(enrichedContext) });
    sendEvent({ type: 'done' });
    return res.end();
  }

  try {
    const stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: buildSystemPrompt(enrichedContext) },
        { role: 'user', content: message || 'Summarize current asset health.' }
      ],
      temperature: 0.3,
      max_tokens: 500,
      stream: true
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        sendEvent({ type: 'text', delta });
      }
    }

    sendEvent({ type: 'done' });
    res.end();
  } catch (err) {
    sendEvent({ type: 'text', delta: fallbackReply(enrichedContext) });
    sendEvent({ type: 'done' });
    res.end();
  }
};
