const Reservation = require('../models/Reservation');
const Listing = require('../models/Listing');
const Payment = require('../models/Payment');
const sendEmail = require('../utils/sendEmail');
const { bookingConfirmationEmail, bookingStatusEmail, newBookingOwnerEmail } = require('../utils/emailTemplates');
const User = require('../models/User');
// Helper — calculate total days
const calcDays = (start, end) => {
  const diff = new Date(end) - new Date(start);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Helper — check booking conflict
const hasConflict = async (listingId, startDate, endDate, excludeId = null) => {
  const query = {
    listing: listingId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
    ]
  };
  if (excludeId) query._id = { $ne: excludeId };
  const conflict = await Reservation.findOne(query);
  return !!conflict;
};

// @POST /api/reservations - Create reservation (renter only)
exports.createReservation = async (req, res) => {
  const { listing, startDate, endDate, message } = req.body;

  // Check listing exists
  const listingDoc = await Listing.findById(listing);
  if (!listingDoc)
    return res.status(404).json({ success: false, message: 'Listing not found' });

  // Check listing is active
  if (listingDoc.status !== 'active')
    return res.status(400).json({ success: false, message: 'Listing is not available' });

  // Check dates are valid
  if (new Date(startDate) >= new Date(endDate))
    return res.status(400).json({ success: false, message: 'End date must be after start date' });

  if (new Date(startDate) < new Date())
    return res.status(400).json({ success: false, message: 'Start date cannot be in the past' });

  // Check booking conflict
  const conflict = await hasConflict(listing, startDate, endDate);
  if (conflict)
    return res.status(400).json({ success: false, message: 'Listing is already booked for these dates' });

  // Calculate total price
  const days = calcDays(startDate, endDate);
  const totalPrice = days * listingDoc.pricePerDay;

  // Create reservation
  const reservation = await Reservation.create({
    renter: req.user.id,
    listing,
    startDate,
    endDate,
    totalPrice,
    message,
  });

  // Create pending payment
  await Payment.create({
    reservation: reservation._id,
    amount: totalPrice,
    method: 'khalti',
    status: 'pending',
  });

  res.status(201).json({ success: true, reservation, totalPrice, days });
};

// @GET /api/reservations - Get my reservations (renter)
exports.getMyReservations = async (req, res) => {
  const reservations = await Reservation.find({ renter: req.user.id })
    .populate('listing', 'title location pricePerDay images')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: reservations.length, reservations });
};

// @GET /api/reservations/owner - Get reservations for owner listings
exports.getOwnerReservations = async (req, res) => {
  const listings = await Listing.find({ owner: req.user.id });
  const listingIds = listings.map(l => l._id);
  const reservations = await Reservation.find({ listing: { $in: listingIds } })
    .populate('renter', 'name email phone')
    .populate('listing', 'title location pricePerDay')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: reservations.length, reservations });
};

// @GET /api/reservations/:id - Get single reservation
exports.getReservation = async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate('renter', 'name email phone')
    .populate('listing', 'title location pricePerDay images');
  if (!reservation)
    return res.status(404).json({ success: false, message: 'Reservation not found' });
  res.status(200).json({ success: true, reservation });
};

// @PUT /api/reservations/:id/confirm - Confirm reservation (owner)
exports.confirmReservation = async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate('listing');
  if (!reservation)
    return res.status(404).json({ success: false, message: 'Reservation not found' });
  if (reservation.listing.owner.toString() !== req.user.id)
    return res.status(403).json({ success: false, message: 'Not authorized' });
  reservation.status = 'confirmed';
  await reservation.save();
  res.status(200).json({ success: true, reservation });
};

// @PUT /api/reservations/:id/complete - Complete reservation (owner)
exports.completeReservation = async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate('listing');
  if (!reservation)
    return res.status(404).json({ success: false, message: 'Reservation not found' });
  if (reservation.listing.owner.toString() !== req.user.id)
    return res.status(403).json({ success: false, message: 'Not authorized' });
  reservation.status = 'completed';
  await reservation.save();
  res.status(200).json({ success: true, reservation });
};

// @PUT /api/reservations/:id/cancel - Cancel reservation
exports.cancelReservation = async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation)
    return res.status(404).json({ success: false, message: 'Reservation not found' });
  if (reservation.renter.toString() !== req.user.id)
    return res.status(403).json({ success: false, message: 'Not authorized' });
  if (reservation.status === 'completed')
    return res.status(400).json({ success: false, message: 'Cannot cancel a completed reservation' });
  reservation.status = 'cancelled';
  await reservation.save();
  res.status(200).json({ success: true, message: 'Reservation cancelled successfully' });
};