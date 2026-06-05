const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const {
  createListing, getAllListings, getListing,
  updateListing, deleteListing, getMyListings
} = require('../controllers/listingController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const Listing = require('../models/Listing');

router.get('/', getAllListings);
router.get('/my', protect, getMyListings);

// Admin - get all listings
router.get('/all', protect, authorize('admin'), async (req, res) => {
  const listings = await Listing.find()
    .populate('owner', 'name email')
    .populate('category', 'name icon')
    .sort('-createdAt');
  res.status(200).json({ success: true, listings });
});

router.get('/:id', getListing);
router.post('/', protect, authorize('owner', 'admin'), createListing);
router.put('/:id', protect, authorize('owner', 'admin'), updateListing);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteListing);

// @POST /api/listings/:id/upload - Upload images
router.post('/:id/upload', protect, authorize('owner', 'admin'), upload.array('images', 5), async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing)
    return res.status(404).json({ success: false, message: 'Listing not found' });
  const imageUrls = req.files.map(file => file.path);
  listing.images = [...listing.images, ...imageUrls];
  await listing.save();
  res.status(200).json({ success: true, images: listing.images });
});

module.exports = router;