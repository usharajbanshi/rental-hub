const Review = require('../models/Review');
const Reservation = require('../models/Reservation');
const Listing = require('../models/Listing');

// @POST /api/reviews - Create review (renter only)
exports.createReview = async (req, res) => {
  const { listing, reservation, rating, comment } = req.body;

  // Check reservation exists and belongs to renter
  const reservationDoc = await Reservation.findById(reservation);
  if (!reservationDoc)
    return res.status(404).json({ success: false, message: 'Reservation not found' });

  if (reservationDoc.renter.toString() !== req.user.id)
    return res.status(403).json({ success: false, message: 'Not authorized to review this reservation' });

  // Check reservation is completed
  if (reservationDoc.status !== 'completed')
    return res.status(400).json({ success: false, message: 'You can only review completed reservations' });

  // Check listing exists
  const listingDoc = await Listing.findById(listing);
  if (!listingDoc)
    return res.status(404).json({ success: false, message: 'Listing not found' });

  // Check already reviewed
  const alreadyReviewed = await Review.findOne({ reviewer: req.user.id, reservation });
  if (alreadyReviewed)
    return res.status(400).json({ success: false, message: 'You have already reviewed this reservation' });

  const review = await Review.create({
    reviewer: req.user.id,
    listing,
    reservation,
    rating,
    comment,
  });

  res.status(201).json({ success: true, review });
};

// @GET /api/reviews/listing/:listingId - Get all reviews for a listing
exports.getListingReviews = async (req, res) => {
  const reviews = await Review.find({ listing: req.params.listingId })
    .populate('reviewer', 'name avatar')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: reviews.length, reviews });
};

// @GET /api/reviews/my - Get my reviews
exports.getMyReviews = async (req, res) => {
  const reviews = await Review.find({ reviewer: req.user.id })
    .populate('listing', 'title location images')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: reviews.length, reviews });
};

// @DELETE /api/reviews/:id - Delete review (renter or admin)
exports.deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review)
    return res.status(404).json({ success: false, message: 'Review not found' });

  if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });

  await review.deleteOne();

  // Recalculate rating
  await Review.calcAverageRating(review.listing);

  res.status(200).json({ success: true, message: 'Review deleted successfully' });
};