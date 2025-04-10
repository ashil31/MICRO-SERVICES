const mongoose = require('mongoose');


const captainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false // Exclude password from queries by default
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
});

module.exports = mongoose.model('captain', captainSchema);