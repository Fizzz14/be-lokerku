'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ItemCategory extends Model {
    static associate(models) {
      // no associations
    }
  }

  ItemCategory.init(
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
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Aktif',
      },
    },
    { sequelize, modelName: 'ItemCategory' }
  );

  return ItemCategory;
};
