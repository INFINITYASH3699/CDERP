// init-settings.js - Script to initialize default system settings
require('dotenv').config();
const mongoose = require('mongoose');
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('MONGODB_URI environment variable not set');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected for settings initialization'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Settings Schema
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String, trim: true },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
});

settingsSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Settings = mongoose.model("Settings", settingsSchema);

// Default settings
const defaultSettings = [
  {
    key: 'restrictLeadEditing',
    value: false,
    description: 'When enabled, only admins or assigned users can edit lead status and contacted fields'
  },
  {
    key: 'restrictCounselorView',
    value: false,
    description: 'When enabled, counselors can only see leads assigned to them'
  },
  {
    key: 'maxLeadsToDisplay',
    value: 0,
    description: 'Maximum number of leads to display on the dashboard (0 shows all leads)'
  },
  {
    key: 'locationBasedAssignment',
    value: false,
    description: 'When enabled, leads will be automatically assigned to counselors based on their location'
  },
  {
    key: 'locationAssignments',
    value: {},
    description: 'Location to counselor mapping for automatic assignment'
  }
];

// Function to initialize settings
async function initializeSettings() {
  try {
    console.log('Initializing default settings...');

    for (const setting of defaultSettings) {
      // Check if setting exists
      const existingSetting = await Settings.findOne({ key: setting.key });

      if (!existingSetting) {
        // Create the setting
        await Settings.create(setting);
        console.log(`Created setting: ${setting.key}`);
      } else {
        console.log(`Setting already exists: ${setting.key}`);
      }
    }

    console.log('Settings initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing settings:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeSettings();
