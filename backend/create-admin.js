// Usage: node create-admin.js <username> <password>
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Admin = mongoose.model('Admin', adminSchema);

(async () => {
  const [,, username, password] = process.argv;
  if (!username || !password) {
    console.log('Usage: node create-admin.js <username> <password>');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  const hash = await bcrypt.hash(password, 12);
  let admin = await Admin.findOne({ username });
  if (admin) {
    admin.password = hash;
    await admin.save();
    console.log('Admin password updated.');
  } else {
    await Admin.create({ username, password: hash });
    console.log('Admin created.');
  }
  await mongoose.disconnect();
  process.exit(0);
})();
