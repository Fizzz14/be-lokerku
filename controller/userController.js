const { User, Role } = require('../models');
const { hashPassword } = require('../helpers/password');

const updateMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { include: [{ model: Role, as: 'role' }] });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const body = req.body || {};

    // Jika ganti email, validasi dulu apakah email baru udah dipake user lain
    if (body.email && body.email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExist = await User.findOne({ where: { email: body.email.toLowerCase() } });
      if (emailExist) {
        return res.status(409).json({ message: 'Email sudah terdaftar oleh pengguna lain' });
      }
      user.email = body.email.toLowerCase();
      user.username = body.email.toLowerCase();
    }

    // Jika ganti password
    if (body.password) {
      if (body.password.length < 6) {
        return res.status(400).json({ message: 'Password minimal harus 6 karakter' });
      }
      user.password = await hashPassword(body.password);
    }

    // Update field yang diperbolehkan lainnya
    ['name', 'phone', 'address'].forEach((field) => {
      if (body[field] !== undefined) user[field] = body[field];
    });

    await user.save();

    res.json({
      id: String(user.id),
      name: user.name,
      email: user.email,
      phone: user.phone || '-',
      address: user.address || '',
      role: user.role.name,
      image: user.image,
    });
  } catch (error) {
    next(error);
  }
};

const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Simpan path file ke database
    user.image = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: 'Foto profil berhasil diperbarui',
      image: user.image,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateMe, uploadPhoto };
