const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  listing: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Listing', 
    required: true 
  },
  reservation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reservation', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    required: true, 
    trim: true 
  },
}, { timestamps: true });

// One review per reservation
reviewSchema.index({ reviewer: 1, reservation: 1 }, { unique: true });

// Auto update listing average rating after review save
reviewSchema.statics.calcAverageRating = async function(listingId) {
  const stats = await this.aggregate([
    { $match: { listing: listingId } },
    { $group: { _id: '$listing', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (stats.length > 0) {
    await mongoose.model('Listing').findByIdAndUpdate(listingId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count
    });
  } else {
    await mongoose.model('Listing').findByIdAndUpdate(listingId, {
      averageRating: 0,
      totalReviews: 0
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.listing);
});

module.exports = mongoose.model('Review', reviewSchema);