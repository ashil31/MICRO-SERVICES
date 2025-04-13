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

module.exports.acceptRide = async (req, res, next) => {
  try {
    const { rideId } = req.query;
    if (!rideId) {
      return res.status(400).json({ message: 'Ride ID and Captain ID are required' });
    }

    // Update the ride with the captain's ID
    const ride = await rideModel.findByIdAndUpdate(
      rideId
    );

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Notify the user about the ride acceptance
    ride.status = 'accepted';
    await ride.save();
    // Publish the ride acceptance event to the queue
    publishToQueue('ride_accepted', JSON.stringify(ride));

    res.send(ride);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}