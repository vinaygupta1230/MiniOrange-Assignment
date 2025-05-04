const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

exports.createToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '1h' });
};

exports.verifyToken = (token) => jwt.verify(token, secret);
