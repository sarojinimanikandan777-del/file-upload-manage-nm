const mongoose = require('mongoose');
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017/filemanager';


async function connectDB() {
await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
console.log('MongoDB connected');
}


module.exports = { connectDB };
