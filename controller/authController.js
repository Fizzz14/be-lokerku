const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { hashPassword, comparePassword } = require('../helpers/password');

const createToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role.name,
    },
    process.env.JWT_SECRET || process.env.AUTH_SECRET || 'secret_lokerku',
    { expiresIn: '7d' }
  );

const toLoginResponse = (user) => ({
  token: createToken(user),
  user: {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role.name,
  },
});

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const role = await Role.findOne({ where: { name: 'user' } });
    if (!role) {
      return res.status(500).json({ message: 'Role user belum tersedia, jalankan seed' });
    }

    const user = await User.create({
      name,
      username: email.toLowerCase(),
      email: email.toLowerCase(),
      phone,
      password: await hashPassword(password),
      roleId: role.id,
    });
    user.role = role;

    res.status(201).json(toLoginResponse(user));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Anda belum pernah membuat akun ini, silakan buat terlebih dahulu' });
    }

    if (!(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    if (user.status !== 'Aktif') {
      return res.status(403).json({ message: 'Akun Anda dinonaktifkan. Silakan hubungi admin.' });
    }

    res.json(toLoginResponse(user));
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, me };
