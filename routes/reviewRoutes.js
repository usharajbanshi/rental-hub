const express = require('express');
const router = express.Router();
const {
  createReview,
  getListingReviews,
  getMyReviews,
  deleteReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, authorize('renter'), createReview);
router.get('/my', protect, authorize('renter'), getMyReviews);
router.get('/listing/:listingId', getListingReviews);
router.delete('/:id', protect, authorize('renter', 'admin'), deleteReview);

module.exports = router;