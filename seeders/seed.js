require('dotenv').config();

const db = require('../models');
const { Role, User, Region, Location, LockerSize, Locker, ItemCategory, Booking, Payment, AccessCard } = db;
const { hashPassword } = require('../helpers/password');

const regionNames = ['Jakarta', 'Bandung', 'Surabaya', 'Bogor', 'Sukabumi'];
const locationSuffixes = ['Central Hub', 'Station Point', 'Mall Corner'];
const sizeRows = [
  { name: 'Kecil', pricePerDay: 2000 },
  { name: 'Sedang', pricePerDay: 4000 },
  { name: 'Besar', pricePerDay: 6000 },
  { name: 'Sangat Besar', pricePerDay: 12000 },
];
const categories = ['Elektronik', 'Dokumen', 'Pakaian', 'Aksesoris'];

const regionCode = (name) =>
  ({
    Jakarta: 'JKT',
    Bandung: 'BDG',
    Surabaya: 'SBY',
    Bogor: 'BGR',
    Sukabumi: 'SKB',
  }[name] || name.slice(0, 3).toUpperCase());

const seed = async () => {
  await db.sequelize.authenticate();

  await AccessCard.destroy({ where: {} });
  await Payment.destroy({ where: {} });
  await Booking.destroy({ where: {} });
  await Locker.destroy({ where: {} });
  await Location.destroy({ where: {} });
  await Region.destroy({ where: {} });
  await LockerSize.destroy({ where: {} });
  await ItemCategory.destroy({ where: {} });
  await User.destroy({ where: {} });
  await Role.destroy({ where: {} });

  const adminRole = await Role.create({ name: 'admin' });
  const userRole = await Role.create({ name: 'user' });

  await User.bulkCreate([
    {
      name: 'Admin Lokerku',
      username: 'admin@gmail.com',
      email: 'admin@gmail.com',
      password: await hashPassword('admin'),
      roleId: adminRole.id,
      status: 'Aktif',
    },
    {
      name: 'User Lokerku',
      username: 'user@gmail.com',
      email: 'user@gmail.com',
      password: await hashPassword('user'),
      phone: '081234567890',
      roleId: userRole.id,
      status: 'Aktif',
    },
  ]);

  const sizes = {};
  for (const row of sizeRows) {
    const size = await LockerSize.create({ ...row, status: 'Aktif' });
    sizes[row.name] = size;
  }

  for (const name of categories) {
    await ItemCategory.create({ name, status: 'Aktif' });
  }

  for (const regionName of regionNames) {
    const region = await Region.create({ name: regionName, status: 'Aktif' });

    for (let locationIndex = 0; locationIndex < locationSuffixes.length; locationIndex += 1) {
      const location = await Location.create({
        name: `Lokerku ${regionName} ${locationSuffixes[locationIndex]}`,
        regionId: region.id,
        address: `${regionName} Area No. ${locationIndex + 1}`,
        openHours: '06.00 - 22.00',
        rating: 4.6 + locationIndex * 0.1,
        status: 'Aktif',
      });

      let lockerCounter = 1;
      for (const sizeName of Object.keys(sizes)) {
        for (let i = 0; i < 8; i += 1) {
          await Locker.create({
            lockerNumber: `${regionCode(regionName)}-${String.fromCharCode(65 + locationIndex)}${String(
              lockerCounter
            ).padStart(2, '0')}`,
            locationId: location.id,
            sizeId: sizes[sizeName].id,
            status: 'available',
          });
          lockerCounter += 1;
        }
      }
    }
  }

  console.log('Seed Lokerku selesai');
};

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
