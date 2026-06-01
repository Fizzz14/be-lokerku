const {
  Locker,
  Region,
  Location,
  LockerSize,
  ItemCategory,
  Booking,
  User,
  Role,
  AccessCard,
  Payment,
} = require('../models');

const masterConfig = {
  daerah: {
    model: Region,
    toResponse: (item) => ({ id: String(item.id), name: item.name, status: item.status }),
    fromBody: (body) => ({ name: body.name, status: body.status || 'Aktif' }),
  },
  lokasi: {
    model: Location,
    include: [{ model: Region, as: 'region' }],
    toResponse: (item) => ({
      id: String(item.id),
      name: item.name,
      region: item.region?.name || item.regionId,
      regionId: String(item.regionId),
      address: item.address,
      openHours: item.openHours,
      rating: item.rating,
      status: item.status,
    }),
    fromBody: (body) => ({
      name: body.name,
      regionId: body.regionId || body.region,
      address: body.address,
      openHours: body.openHours || '06.00 - 22.00',
      rating: body.rating ?? 4.8,
      status: body.status || 'Aktif',
    }),
  },
  ukuran: {
    model: LockerSize,
    toResponse: (item) => ({
      id: String(item.id),
      name: item.name,
      pricePerDay: item.pricePerDay,
      status: item.status,
    }),
    fromBody: (body) => ({
      name: body.name,
      pricePerDay: body.pricePerDay ?? body.price,
      status: body.status || 'Aktif',
    }),
  },
  kategori: {
    model: ItemCategory,
    toResponse: (item) => ({ id: String(item.id), name: item.name, status: item.status }),
    fromBody: (body) => ({ name: body.name, status: body.status || 'Aktif' }),
  },
};

const getMaster = (type) => {
  // Ubah ke lowercase & hilangkan spasi untuk menghindari case-sensitivity
  const normalizedType = String(type || '').toLowerCase().trim();
  const aliases = {
    'daerah': 'daerah',
    'region': 'daerah',
    'regions': 'daerah',

    'lokasi': 'lokasi',
    'location': 'lokasi',
    'locations': 'lokasi',

    'ukuran': 'ukuran',
    'size': 'ukuran',
    'sizes': 'ukuran',

    'kategori': 'kategori',
    'category': 'kategori',
    'categories': 'kategori',
  };

  const targetType = aliases[normalizedType];
  const config = masterConfig[targetType];

  if (!config) {
    const error = new Error('Tipe master tidak didukung');
    error.statusCode = 400;
    throw error;
  }
  return config;
};

const getSummary = async (req, res, next) => {
  try {
    const [revenue, transactions, totalLockers, occupiedLockers, activeCards] = await Promise.all([
      Payment.sum('amount', { where: { status: 'paid' } }),
      Booking.count(),
      Locker.count(),
      Locker.count({ where: { status: 'occupied' } }),
      AccessCard.count({ where: { cardStatus: 'active' } }),
    ]);

    res.json({
      revenue: revenue || 0,
      transactions: transactions || 0,
      occupancy: totalLockers ? Math.round((occupiedLockers / totalLockers) * 100) : 0,
      activeCards: activeCards || 0,
    });
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const [totalLockers, occupiedLockers, currentMonthRevenue] = await Promise.all([
      Locker.count(),
      Locker.count({ where: { status: 'occupied' } }),
      Payment.sum('amount', { where: { status: 'paid' } }),
    ]);

    const occupancyRate = totalLockers ? Math.round((occupiedLockers / totalLockers) * 100) : 0;

    res.json({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
      revenue: [0, 0, 0, 0, 0, currentMonthRevenue || 0],
      occupancy: [0, 0, 0, 0, 0, occupancyRate],
    });
  } catch (error) {
    next(error);
  }
};

const getLockers = async (req, res, next) => {
  try {
    const locations = await Location.findAll({
      include: [{ model: Region, as: 'region' }],
      order: [['name', 'ASC']],
    });

    const rows = await Promise.all(
      locations.map(async (location) => {
        const [lockers, available] = await Promise.all([
          Locker.count({ where: { locationId: location.id } }),
          Locker.count({ where: { locationId: location.id, status: 'available' } }),
        ]);

        return {
          id: String(location.id),
          name: location.name,
          region: location.region.name,
          address: location.address,
          openHours: location.openHours,
          lockers,
          available,
          occupancy: lockers ? Math.round(((lockers - available) / lockers) * 100) : 0,
          rating: location.rating,
        };
      })
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

const listMaster = async (req, res, next) => {
  try {
    const config = getMaster(req.params.type);
    const rows = await config.model.findAll({
      include: config.include,
      order: [['name', 'ASC']],
    });
    res.json(rows.map(config.toResponse));
  } catch (error) {
    next(error);
  }
};

const regionCode = (name) =>
  ({
    Jakarta: 'JKT',
    Bandung: 'BDG',
    Surabaya: 'SBY',
    Bogor: 'BGR',
    Sukabumi: 'SKB',
  }[name] || String(name || 'LKR').slice(0, 3).toUpperCase());

// bkin unit loker kosong untuk setiap ukuran pas admin buat lok bru
const provisionLockersForLocation = async (location) => {
  const region = await Region.findByPk(location.regionId);
  const sizes = await LockerSize.findAll({ where: { status: 'Aktif' } }); 
  const code = regionCode(region?.name); // Bikin kode daerah misal: JKT
  let counter = 1;

  // ngelakuin perulangan untuk setiap ukuran yang ada
  for (const size of sizes) {
    // bikin unit loker untuk masing-masing ukuran
    for (let index = 0; index < 8; index += 1) {
      await Locker.create({
        lockerNumber: `${code}-L${location.id}-${String(counter).padStart(3, '0')}`, // Format: JKT-L1-001
        locationId: location.id,
        sizeId: size.id,
        status: 'available', // Status awal kosong / bisa disewa
      });
      counter += 1;
    }
  }
};

const provisionLockersForNewSize = async (size) => {
  const locations = await Location.findAll(); // Ambil daftar semua lokasi loker yang ada saat ini
  
  // biar setiap lok,nambah ukuran tsb
  for (const location of locations) {
    const region = await Region.findByPk(location.regionId);
    const code = regionCode(region?.name);
    
    // Cari jumlah loker yang sudah ada di lokasi tersebut biar counternya gak bentrok
    const lockerCount = await Locker.count({ where: { locationId: location.id } });
    let counter = lockerCount + 1;

    // bikin unit loker kosong baru
    for (let index = 0; index < 8; index += 1) {
      await Locker.create({
        lockerNumber: `${code}-L${location.id}-${String(counter).padStart(3, '0')}`,
        locationId: location.id,
        sizeId: size.id,
        status: 'available',
      });
      counter += 1;
    }
  }
};

// tambah Data Master Baru (Daerah, Lokasi, Ukuran, atau Kategori)
const createMaster = async (req, res, next) => {
  try {
    const config = getMaster(req.params.type);
    // Buat data master baru di database
    const row = await config.model.create(config.fromBody(req.body || {}));

    // Kalau data yang ditambah adalah lokasi baru
    if (req.params.type === 'lokasi') {
      await provisionLockersForLocation(row); // Bikin loker fisiknya otomatis!
    } 
    // Kalau data yang ditambah adalah ukuran loker baru
    else if (req.params.type === 'ukuran') {
      await provisionLockersForNewSize(row); // Pasangkan ke semua lokasi yang ada!
    }

    const fresh = await config.model.findByPk(row.id, { include: config.include });
    res.status(201).json(config.toResponse(fresh || row));
  } catch (error) {
    next(error);
  }
};

const updateMaster = async (req, res, next) => {
  try {
    const config = getMaster(req.params.type);
    const row = await config.model.findByPk(req.params.id);

    if (!row) return res.status(404).json({ message: 'Data tidak ditemukan' });

    await row.update(config.fromBody(req.body || {}));
    const fresh = await config.model.findByPk(row.id, { include: config.include });

    res.json(config.toResponse(fresh || row));
  } catch (error) {
    next(error);
  }
};

const deleteMaster = async (req, res, next) => {
  try {
    const config = getMaster(req.params.type);
    const row = await config.model.findByPk(req.params.id);

    if (!row) return res.status(404).json({ message: 'Data tidak ditemukan' });

    await row.destroy();
    res.json({ message: 'Data berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

const getRelations = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'status'] },
        { model: Location, as: 'location', attributes: ['id', 'name'] },
        { model: Locker, as: 'locker', attributes: ['id', 'lockerNumber'] },
        { model: AccessCard, as: 'accessCard', attributes: ['id', 'accessCode', 'cardStatus'] },
      ],
      order: [['date', 'DESC']],
    });

    res.json(
      bookings.map((booking) => {
        // Jika status user adalah Nonaktif, maka buat status transaksi & kartu menjadi Nonaktif/inactive 
        const isUserDeactivated = booking.user?.status === 'Nonaktif';
        return {
          id: booking.transactionId,
          user: booking.user?.name || '-',
          location: booking.location?.name || '-',
          locker: booking.locker?.lockerNumber || '-',
          card: booking.accessCard?.accessCode || '-',
          cardId: booking.accessCard?.id ? String(booking.accessCard.id) : null,
          cardStatus: isUserDeactivated ? 'inactive' : (booking.accessCard?.cardStatus || 'inactive'),
          status: isUserDeactivated ? 'Nonaktif' : booking.status,
        };
      })
    );
  } catch (error) {
    next(error);
  }
};

const simulateTransaction = async (req, res) => {
  res.json({
    success: true,
    status: 'Proses berhasil',
    message: 'Simulasi transaksi berhasil',
    steps: [
      'Booking dibuat',
      'Status loker dikunci',
      'Payment dicatat',
      'Kartu akses dibuat',
    ],
    payload: req.body || {},
  });
};

const getUsers = async (req, res, next) => {
  try {
    const rows = await User.findAll({
      include: [{ model: Role, as: 'role' }],
      order: [['name', 'ASC']],
    });
    res.json(
      rows.map((user) => ({
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone || '-',
        role: user.role?.name || '-',
        status: user.status,
      }))
    );
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    await user.update(req.body);
    res.json({ message: 'User berhasil diperbarui', user });
  } catch (error) {
    next(error);
  }
};

const updateCardStatus = async (req, res, next) => {
  try {
    const card = await AccessCard.findByPk(req.params.id);
    if (!card) return res.status(404).json({ message: 'Kartu tidak ditemukan' });

    await card.update({ cardStatus: req.body.status });
    res.json({ message: 'Status kartu berhasil diperbarui', card });
  } catch (error) {
    next(error);
  }
};

// Menghapus data User dari database secara permanen
// Seluruh data relasi otomatis ikut terhapus 
const deleteUser = async (req, res, next) => {
  try {
    //Cari user di database berdasarkan ID yang dikirim melalui parameter URL
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    await user.destroy();
    
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getReports,
  getLockers,
  listMaster,
  createMaster,
  updateMaster,
  deleteMaster,
  getRelations,
  simulateTransaction,
  getUsers,
  updateUser,
  updateCardStatus,
  deleteUser,
};
