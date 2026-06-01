'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Lockers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      lockerNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      locationId: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      sizeId: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'available'
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

    // Membuat foreign key locationId
    await queryInterface.addConstraint('Lockers', {
      fields: ['locationId'],
      type: 'foreign key',
      name: 'fk_lockers_locationId',
      references: {
        table: 'Locations',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Membuat foreign key sizeId
    await queryInterface.addConstraint('Lockers', {
      fields: ['sizeId'],
      type: 'foreign key',
      name: 'fk_lockers_sizeId',
      references: {
        table: 'LockerSizes',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Lockers');
  }
};
