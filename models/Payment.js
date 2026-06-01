'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'booking', constraints: false });
    }
  }

  Payment.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      bookingId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'simulate'
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'paid'
      },
      paidAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
    },
    { sequelize, modelName: 'Payment' }
  );

  return Payment;
};
