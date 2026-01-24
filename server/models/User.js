import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  dailyGoal: {
    type: Number,
    default: 180, // 3 hours in minutes
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model('User', userSchema)
