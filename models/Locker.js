'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Locker extends Model {
    static associate(models) {
      Locker.belongsTo(models.Location, { foreignKey: 'locationId', as: 'location', constraints: false });
      Locker.belongsTo(models.LockerSize, { foreignKey: 'sizeId', as: 'size', constraints: false });
      Locker.hasMany(models.Booking, { foreignKey: 'lockerId', as: 'bookings', constraints: false });
    }
  }

  Locker.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      lockerNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      locationId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      sizeId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'available',
      },
    },
    { sequelize, modelName: 'Locker' }
  );

  return Locker;
};
