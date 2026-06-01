const { Location, Region, Locker, LockerSize } = require('../models');

const formatLocation = async (location) => {
  const lockers = await Locker.findAll({
    where: { locationId: location.id },
    include: [{ model: LockerSize, as: 'size' }],
  });
  const available = lockers.filter((locker) => locker.status === 'available').length;
  const sizes = lockers.reduce((acc, locker) => {
    const sizeName = locker.size.name;
    if (!acc[sizeName]) {
      acc[sizeName] = {
        name: sizeName,
        pricePerDay: locker.size.pricePerDay,
        total: 0,
        available: 0,
      };
    }
    acc[sizeName].total += 1;
    if (locker.status === 'available') acc[sizeName].available += 1;
    return acc;
  }, {});

  return {
    id: String(location.id),
    name: location.name,
    region: location.region.name,
    address: location.address,
    openHours: location.openHours,
    rating: location.rating,
    lockers: lockers.length,
    available,
    sizes: Object.values(sizes),
  };
};

const getLocations = async (req, res, next) => {
  try {
    const locations = await Location.findAll({
      where: { status: 'Aktif' },
      include: [{ model: Region, as: 'region' }],
      order: [['name', 'ASC']],
    });
    const filtered = req.query.region
      ? locations.filter((location) => location.region.name.toLowerCase() === req.query.region.toLowerCase())
      : locations;

    res.json(await Promise.all(filtered.map(formatLocation)));
  } catch (error) {
    next(error);
  }
};

const getLocationById = async (req, res, next) => {
  try {
    const location = await Location.findByPk(req.params.id, {
      include: [{ model: Region, as: 'region' }],
    });

    if (!location) {
      return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
    }

    res.json(await formatLocation(location));
  } catch (error) {
    next(error);
  }
};

module.exports = { getLocations, getLocationById };
