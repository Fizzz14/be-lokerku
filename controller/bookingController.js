const db = require('../models');
const { Booking, Location, Locker, LockerSize, Payment, AccessCard } = db;

// Fungsi helper buat nambahin angka nol di depan ID transaksi biar formatnya rapi misal:TRX-001
const pad = (number) => String(number).padStart(3, '0');

// Fungsi nyari nomor transaksi berikutnya secara otomatis di database
const nextTransactionId = async (transaction) => {
  const count = await Booking.count({ transaction });
  return `TRX-${pad(count + 1)}`; // Outputnya bakal "TRX-001", "TRX-002", dst.
};

const formatBooking = (booking, card) => ({
  id: booking.transactionId,
  locationId: String(booking.location.id),
  locationName: booking.location.name,
  lockerNumber: booking.locker.lockerNumber,
  size: booking.size.name,
  duration: booking.duration,
  total: booking.total,
  status: booking.status,
  date: booking.date.toISOString(),
  accessCode: card ? card.accessCode : null,
  cardStatus: card ? card.cardStatus : 'inactive',
});

//  Bikin Transaksi Sewa Baru (Pake Database Transaction biar super aman!)
const createBooking = async (req, res, next) => {
  // Mulai transaksi database (kalau di tengah jalan ada error, data otomatis direset/rollback)
  const transaction = await db.sequelize.transaction();

  try {
    // Ambil data yang dikirim dari form frontend (FormSewa.jsx)
    const { locationId, size, duration, total, notes } = req.body || {};

    // Validasi data input: kalau gak lengkap, batalin transaksi!
    if (!locationId || !size || !duration || total === undefined) {
      await transaction.rollback();
      return res.status(400).json({ message: 'locationId, size, duration, dan total wajib diisi' });
    }

    // Cari lokasi stasiun lokernya ada apa enggak di database
    const location = await Location.findByPk(locationId, { transaction });
    if (!location) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
    }

    // Cari data ukuran loker yang dipilih (Kecil, Sedang, Besar, atau Sangat Besar)
    const lockerSize = await LockerSize.findOne({ where: { name: size, status: 'Aktif' }, transaction });
    if (!lockerSize) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Ukuran loker tidak ditemukan' });
    }

    // Kalkulasi ulang total harga di backend biar gak bisa dimanipulasi dari frontend
    const calculatedTotal = lockerSize.pricePerDay * Number(duration);
    if (Number(total) !== calculatedTotal) {
      await transaction.rollback();
      return res.status(400).json({ message: `Total tidak sesuai. Total seharusnya ${calculatedTotal}` });
    }

    // Cari unit loker fisik yang kosong (status = 'available') di lokasi & berukuran tersebut
    const locker = await Locker.findOne({
      where: { locationId: location.id, sizeId: lockerSize.id, status: 'available' },
      order: [['lockerNumber', 'ASC']], // Ambil unit loker dengan nomor paling awal
      transaction,
      lock: transaction.LOCK.UPDATE, // Kunci baris loker ini biar gak disewa orang lain di detik yang sama
    });

    // Kalau loker ukuran tersebut penuh, batalkan transaksi sewa
    if (!locker) {
      await transaction.rollback();
      return res.status(409).json({ message: 'Loker kosong tidak tersedia untuk ukuran ini' });
    }

    // Ubah status loker fisik jadi terisi ('occupied')
    locker.status = 'occupied';
    await locker.save({ transaction });

    // Buat baris data Booking (Sewa) baru di database
    const transactionId = await nextTransactionId(transaction);
    const booking = await Booking.create(
      {
        transactionId,
        userId: req.user.id, // Ambil ID user dari JWT Token hasil login
        locationId: location.id,
        lockerId: locker.id,
        sizeId: lockerSize.id,
        duration,
        total,
        notes, // Catatan barang apa yang disimpan
        date: new Date(),
      },
      { transaction }
    );

    // Otomatis buat pencatatan pembayaran (Payment) baru
    await Payment.create(
      {
        bookingId: booking.id,
        transactionId,
        amount: total,
      },
      { transaction }
    );

    // Bikin Kartu Akses (Access Card) & QR Payload unik untuk user
    const accessCode = `LOKERKU:${transactionId}:${locker.lockerNumber}`;
    const card = await AccessCard.create(
      {
        bookingId: booking.id,
        transactionId,
        accessCode,
        qrPayload: accessCode,
      },
      { transaction }
    );

    // Kalau semua langkah di atas sukses tanpa hambatan, commit/simpan permanen ke database!
    await transaction.commit();

    // Satukan objek relasi untuk dikirim kembali ke frontend
    booking.location = location;
    booking.locker = locker;
    booking.size = lockerSize;

    // Respon sukses sewa loker dengan format JSON
    res.status(201).json(formatBooking(booking, card));
  } catch (error) {
    // Jika ada satu saja langkah di blok try yang gagal, batalkan semua manipulasi data di database!
    await transaction.rollback();
    next(error);
  }
};

// FUNGSI: Ambil daftar riwayat transaksi milik user yang sedang login
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id }, // Cari yang user ID-nya cocok dengan token login
      include: [
        { model: Location, as: 'location' },
        { model: Locker, as: 'locker' },
        { model: LockerSize, as: 'size' },
        { model: AccessCard, as: 'accessCard' },
      ],
      order: [['createdAt', 'DESC']], // Urutkan dari transaksi sewa terbaru
    });

    res.json(bookings.map((booking) => formatBooking(booking, booking.accessCard)));
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getMyBookings };
