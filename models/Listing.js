const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  location: { type: String, required: true },
  coordinates: {
  lat: { type: Number, default: 27.7172 },
  lng: { type: Number, default: 85.3240 }
  },
  images: [{ type: String }],
  amenities: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive', 'booked'], default: 'active' },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);