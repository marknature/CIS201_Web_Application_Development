const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

class ComplianceLog extends Model {}

ComplianceLog.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  severity: {
    type: DataTypes.ENUM('error', 'warning', 'info'),
    allowNull: false,
  },
  ruleType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., max_weekly_hours, min_rest_period'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional context e.g., actual hours vs allowed'
  }
}, {
  sequelize,
  modelName: 'ComplianceLog',
  tableName: 'compliance_logs',
  timestamps: true,
});

module.exports = ComplianceLog;
