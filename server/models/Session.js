import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    required: true,
  },
  timerMode: {
    type: String,
    enum: ['stopwatch', 'countdown'],
    default: 'stopwatch',
  },
  countdownMinutes: {
    type: Number,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  focusTime: {
    type: Number, // milliseconds
    default: 0,
  },
  breakTime: {
    type: Number, // milliseconds
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

// Index for efficient querying by user and date
sessionSchema.index({ user: 1, startTime: -1 })

export default mongoose.model('Session', sessionSchema)
