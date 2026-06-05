const express = require('express');
const router = express.Router();
const {
  initiateEsewa,
  verifyEsewa,
  getMyPayments
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/esewa/initiate', protect, authorize('renter'), initiateEsewa);
router.post('/esewa/verify', protect, verifyEsewa);
router.get('/my', protect, getMyPayments);

module.exports = router;