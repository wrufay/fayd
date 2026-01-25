import mongoose from 'mongoose'

const quickLinkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'other',
  },
  label: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for user and limit to 5 per user
quickLinkSchema.index({ user: 1, order: 1 })

export default mongoose.model('QuickLink', quickLinkSchema)
