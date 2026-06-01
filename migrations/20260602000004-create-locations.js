'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      regionId: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      openHours: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '06.00 - 22.00'
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 4.8
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Aktif'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Membuat foreign key regionId
    await queryInterface.addConstraint('Locations', {
      fields: ['regionId'],
      type: 'foreign key',
      name: 'fk_locations_regionId',
      references: {
        table: 'Regions',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Locations');
  }
};
