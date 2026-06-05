const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getOwnerReservations,
  getReservation,
  confirmReservation,
  cancelReservation,
  completeReservation
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const Reservation = require('../models/Reservation');

// Admin - get all reservations
router.get('/all', protect, authorize('admin'), async (req, res) => {
  const reservations = await Reservation.find()
    .populate('renter', 'name email')
    .populate('listing', 'title location')
    .sort('-createdAt');
  res.status(200).json({ success: true, reservations });
});

router.post('/', protect, authorize('renter'), createReservation);
router.get('/', protect, authorize('renter'), getMyReservations);
router.get('/owner', protect, authorize('owner'), getOwnerReservations);
router.get('/:id', protect, getReservation);
router.put('/:id/confirm', protect, authorize('owner'), confirmReservation);
router.put('/:id/cancel', protect, authorize('renter'), cancelReservation);
router.put('/:id/complete', protect, authorize('owner'), completeReservation);

module.exports = router;