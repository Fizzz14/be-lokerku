'use strict';

const { Item } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const items = await Item.findAll();

    const dummyLoans = [];
    // membuat data sebanyak 15
    for (let i = 1; i <= 15; i++) {
      // Math.random() : menghasilkan angka random 0 - 1, Math.floor() : membulatkan kebawah (ambil angka sblm koma/desimal)
      // contoh : random menghasilkan 0.25 dan length 3 maka 0.45 x 3 = 1.35, diambil floor jadi 1. maka item id yg akan digunakan 1
      const randomItem = items[Math.floor(Math.random() * items.length)];
      // menyimpan data dummy ke array
      dummyLoans.push({
        item_id: randomItem.id,
        name: `Peminjam ke-${i}`,
        total_item: 1, 
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    // insert ke table Loans
    await queryInterface.bulkInsert('Loans', dummyLoans);
  },

  async down (queryInterface, Sequelize) {
    // jika seeder di undo, table Loans akan dikosongkan
    await queryInterface.bulkDelete('Loans', null, {});
  }
};
