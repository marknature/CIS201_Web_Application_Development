const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

class OvertimeRecord extends Model {}

OvertimeRecord.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  hours: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('proposed', 'accepted', 'declined'),
    defaultValue: 'proposed',
  },
  rate: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Multiplier e.g., 1.5'
  }
}, {
  sequelize,
  modelName: 'OvertimeRecord',
  tableName: 'overtime_records',
  timestamps: true,
});

module.exports = OvertimeRecord;
