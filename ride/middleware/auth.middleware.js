const jwt = require('jsonwebtoken');
const axios = require('axios');


module.exports.userAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[ 1 ];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized from token not found' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const response = await axios.get(`${process.env.BASE_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);    
    const user = response.data;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized from user not found' });
    }
    req.user = user;

    next();
  } catch (error) { 
    console.log(error);    
    return res.status(401).json({ message: 'Unauthorized from catch block' });
  }
}

module.exports.captainAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[ 1 ];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized from token not found' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const response = await axios.get(`${process.env.BASE_URL}/captain/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);    
    const captain = response.data;
    if (!captain) {
      return res.status(401).json({ message: 'Unauthorized from captain not found' });
    }
    req.captain = captain;

    next();
  } catch (error) { 
    console.log(error);    
    return res.status(401).json({ message: 'Unauthorized from catch block' });
  }
}