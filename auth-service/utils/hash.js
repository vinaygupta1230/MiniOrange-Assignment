const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

exports.hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);
exports.comparePassword = (input, hash) => bcrypt.compare(input, hash);
