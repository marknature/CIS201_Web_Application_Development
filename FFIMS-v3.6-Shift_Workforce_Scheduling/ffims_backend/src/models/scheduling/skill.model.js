const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

class Skill extends Model {}

Skill.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'E.g., garden work, brush cutting, driving, electrical'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'Skill',
  tableName: 'skills',
  timestamps: true,
});

module.exports = Skill;
