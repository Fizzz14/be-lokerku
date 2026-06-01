'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LockerSize extends Model {
    static associate(models) {
      LockerSize.hasMany(models.Locker, { foreignKey: 'sizeId', as: 'lockers', constraints: false });
      LockerSize.hasMany(models.Booking, { foreignKey: 'sizeId', as: 'bookings', constraints: false });
    }
  }

  LockerSize.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      pricePerDay: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Aktif',
      },
    },
    { sequelize, modelName: 'LockerSize' }
  );

  return LockerSize;
};
