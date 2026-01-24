import mongoose from 'mongoose'

const tagSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#4B6EF5',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Compound index to ensure unique tag names per user
tagSchema.index({ user: 1, name: 1 }, { unique: true })

export default mongoose.model('Tag', tagSchema)
