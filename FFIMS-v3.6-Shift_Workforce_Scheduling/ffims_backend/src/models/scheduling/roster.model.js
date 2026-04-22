const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

class Roster extends Model {}

Roster.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  shiftDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  shiftType: {
    type: DataTypes.ENUM('duty', 'standby', 'leave', 'rest', 'ot'),
    allowNull: false,
    defaultValue: 'duty',
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  durationHours: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'Roster',
  tableName: 'rosters',
  timestamps: true,
});

module.exports = Roster;
