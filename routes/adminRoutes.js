const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
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
} = require('../controller/adminController');

const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.use(authMiddleware, roleMiddleware('admin'));

router.get('/summary', getSummary);
router.get('/reports', getReports);
router.get('/lockers', getLockers);
router.get('/relations', getRelations);
router.post('/transactions/simulate', upload.none(), simulateTransaction);
router.get('/master/:type', listMaster);
router.post('/master/:type', upload.none(), createMaster);
router.put('/master/:type/:id', upload.none(), updateMaster);
router.delete('/master/:type/:id', deleteMaster);

// rute buat atmin
router.get('/users', getUsers); // Mendapatkan seluruh daftar user
router.put('/users/:id', upload.none(), updateUser); // Mengubah data/status aktif user
router.delete('/users/:id', deleteUser); // Menghapus akun user secara permanen (Cascade Delete)
router.put('/cards/:id/status', upload.none(), updateCardStatus);

module.exports = router;
