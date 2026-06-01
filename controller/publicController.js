const db = require('../models');
const { Region, LockerSize } = db;

const getRegions = async (req, res, next) => {
  try {
    const rows = await Region.findAll({
      where: { status: 'Aktif' },
      order: [['name', 'ASC']],
    });
    res.json(rows.map((row) => ({ id: String(row.id), name: row.name })));
  } catch (error) {
    next(error);
  }
};

const getLockerSizes = async (req, res, next) => {
  try {
    const rows = await LockerSize.findAll({
      where: { status: 'Aktif' },
      order: [['pricePerDay', 'ASC']],
    });
    res.json(
      rows.map((row) => ({
        id: String(row.id),
        name: row.name,
        pricePerDay: row.pricePerDay,
      }))
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { getRegions, getLockerSizes };
