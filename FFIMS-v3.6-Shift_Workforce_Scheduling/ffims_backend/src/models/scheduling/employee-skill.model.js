const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

class EmployeeSkill extends Model {}

EmployeeSkill.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  proficiencyLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Proficiency from 1 (Beginner) to 5 (Expert)'
  }
}, {
  sequelize,
  modelName: 'EmployeeSkill',
  tableName: 'employee_skills',
  timestamps: true,
});

module.exports = EmployeeSkill;
