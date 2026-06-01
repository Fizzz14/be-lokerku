const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.AUTH_SECRET || 'secret_lokerku');
    const user = await User.findByPk(decoded.id, { include: [{ model: Role, as: 'role' }] });

    if (!user) {
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }

    if (user.status !== 'Aktif') {
      return res.status(403).json({ message: 'Akun Anda telah dinonaktifkan. Sesi dibatalkan.' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};

module.exports = authMiddleware;
