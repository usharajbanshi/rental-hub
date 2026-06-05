// const express = require('express');
// const router = express.Router();

// router.get('/', (req, res) => res.json({ message: 'Listing routes working' }));

// module.exports = router;
const Listing = require('../models/Listing');
const Category = require('../models/Category');

// @POST /api/listings - Create listing (owner only)
exports.createListing = async (req, res) => {
  const { title, description, pricePerDay, location, category, amenities } = req.body;
  const categoryExists = await Category.findById(category);
  if (!categoryExists)
    return res.status(404).json({ success: false, message: 'Category not found' });
  const listing = await Listing.create({
    owner: req.user.id,
    category,
    title,
    description,
    pricePerDay,
    location,
    amenities,
  });
  res.status(201).json({ success: true, listing });
};
// @GET /api/listings - Get all listings with advanced filtering
exports.getAllListings = async (req, res) => {
  const {
    category, location, minPrice, maxPrice,
    search, sort, amenities, status, page, limit
  } = req.query;

  let filter = { status: 'active' };

  // Category filter
  if (category) filter.category = category;

  // Location filter (case insensitive)
  if (location) filter.location = new RegExp(location, 'i');

  // Search by title or description
  if (search) {
    filter.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { location: new RegExp(search, 'i') },
    ];
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
  }

  // Amenities filter
  if (amenities) {
    const amenityList = amenities.split(',').map(a => a.trim());
    filter.amenities = { $all: amenityList };
  }

  // Sorting
  let sortOption = '-createdAt';
  if (sort === 'price_asc') sortOption = 'pricePerDay';
  if (sort === 'price_desc') sortOption = '-pricePerDay';
  if (sort === 'rating') sortOption = '-averageRating';
  if (sort === 'newest') sortOption = '-createdAt';
  if (sort === 'oldest') sortOption = 'createdAt';

  // Pagination
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 9;
  const skip = (pageNum - 1) * limitNum;

  const total = await Listing.countDocuments(filter);
  const listings = await Listing.find(filter)
    .populate('owner', 'name email phone')
    .populate('category', 'name icon')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: listings.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    listings
  });
};

// @GET /api/listings/:id - Get single listing
exports.getListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate('owner', 'name email phone')
    .populate('category', 'name icon');
  if (!listing)
    return res.status(404).json({ success: false, message: 'Listing not found' });
  res.status(200).json({ success: true, listing });
};

// @PUT /api/listings/:id - Update listing (owner only)
exports.updateListing = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  if (!listing)
    return res.status(404).json({ success: false, message: 'Listing not found' });
  if (listing.owner.toString() !== req.user.id)
    return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
  listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, listing });
};

// @DELETE /api/listings/:id - Delete listing (owner only)
exports.deleteListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing)
    return res.status(404).json({ success: false, message: 'Listing not found' });
  if (listing.owner.toString() !== req.user.id)
    return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
  await listing.deleteOne();
  res.status(200).json({ success: true, message: 'Listing deleted successfully' });
};

// @GET /api/listings/my - Get my listings (owner)
exports.getMyListings = async (req, res) => {
  const listings = await Listing.find({ owner: req.user.id })
    .populate('category', 'name icon')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: listings.length, listings });
};