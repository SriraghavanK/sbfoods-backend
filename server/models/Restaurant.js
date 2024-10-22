const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  image: { type: String, required: true },
  isLateNight: { type: Boolean, default: false },
  location: { type: String, required: true },
});

module.exports = mongoose.model('Restaurant', restaurantSchema);