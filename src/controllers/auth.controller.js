const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';


exports.register = async (req, res, next) => {
try {
const { name, email, password } = req.body;
const exists = await User.findOne({ email });
if (exists) return res.status(400).json({ error: 'Email already used' });
const passwordHash = await bcrypt.hash(password, 10);
const user = await User.create({ name, email, passwordHash });
res.json({ id: user._id, name: user.name, email: user.email });
} catch (err) { next(err); }
};


exports.login = async (req, res, next) => {
try {
const { email, password } = req.body;
const user = await User.findOne({ email });
if (!user) return res.status(401).json({ error: 'Invalid credentials' });
const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
} catch (err) { next(err); }
};


exports.me = async (req, res, next) => {
try {
const user = await User.findById(req.user.userId).select('-passwordHash');
res.json(user);
} catch (err) { next(err); }
};
