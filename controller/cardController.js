const { Booking, Location, Locker, LockerSize, AccessCard } = require('../models');

const getCardByTransactionId = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      where: { transactionId: req.params.transactionId },
      include: [
        { model: Location, as: 'location' },
        { model: Locker, as: 'locker' },
        { model: LockerSize, as: 'size' },
        { model: AccessCard, as: 'accessCard' },
      ],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    if (req.user.role !== 'admin' && Number(booking.userId) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    res.json({
      id: booking.transactionId,
      locationName: booking.location.name,
      lockerNumber: booking.locker.lockerNumber,
      size: booking.size.name,
      duration: booking.duration,
      total: booking.total,
      status: booking.status,
      date: booking.date.toISOString(),
      accessCode: booking.accessCard.accessCode,
      cardStatus: booking.accessCard.cardStatus,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCardByTransactionId };
