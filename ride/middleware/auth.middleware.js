const jwt = require('jsonwebtoken');
const axios = require('axios');


module.exports.userAuth = async (req, res, next) => {
  try {
    const token = req.cookie.token || req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
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
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user;

    next();
  } catch (error) { 
    return res.status(401).json({ message: 'Unauthorized' });
  }
}