const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

class Employee extends Model {}

Employee.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  mongoUserId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Links to the Mongoose User _id'
  },
  licenseClass: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  team: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  seniorityDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  sequelize,
  modelName: 'Employee',
  tableName: 'employees',
  timestamps: true,
});

module.exports = Employee;
