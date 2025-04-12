const rideModel = require('../models/ride.model');
const { publishToQueue, subscribeToQueue } = require('../service/rabbit');


module.exports.createRide = async (req, res, next) => {
  try {
    const { pickup, destination } = req.body;
    // const user = req.user;
    if (!pickup || !destination) {
      return res.status(400).json({ message: 'Pickup and destination are required' });
    }
    
    const ride = new rideModel({
      user: req.user._id,
      pickup,
      destination,
    });

    await ride.save();
    // Publish the ride creation event to the queue
    publishToQueue('new_ride', JSON.stringify(ride));

    res.send(ride);


  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}