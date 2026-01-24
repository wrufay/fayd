import express from 'express'
import Session from '../models/Session.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/sessions
// @desc    Get all sessions for user
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, tagId } = req.query

    const query = { user: req.user._id }

    if (startDate || endDate) {
      query.startTime = {}
      if (startDate) query.startTime.$gte = new Date(startDate)
      if (endDate) query.startTime.$lte = new Date(endDate)
    }

    if (tagId) {
      query.tag = tagId
    }

    const sessions = await Session.find(query)
      .populate('tag', 'name color')
      .sort({ startTime: -1 })

    res.json(sessions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/sessions/stats
// @desc    Get session statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const { period } = req.query // 'today', 'week', 'month', 'year'

    let startDate = new Date()
    startDate.setHours(0, 0, 0, 0)

    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      // 'today' is default
    }

    const sessions = await Session.find({
      user: req.user._id,
      startTime: { $gte: startDate },
      completed: true,
    }).populate('tag', 'name color')

    const totalFocusTime = sessions.reduce((sum, s) => sum + s.focusTime, 0)
    const totalBreakTime = sessions.reduce((sum, s) => sum + s.breakTime, 0)

    // Group by tag
    const byTag = sessions.reduce((acc, session) => {
      const tagId = session.tag._id.toString()
      if (!acc[tagId]) {
        acc[tagId] = {
          tag: session.tag,
          focusTime: 0,
          sessionCount: 0,
        }
      }
      acc[tagId].focusTime += session.focusTime
      acc[tagId].sessionCount += 1
      return acc
    }, {})

    res.json({
      totalFocusTime,
      totalBreakTime,
      sessionCount: sessions.length,
      byTag: Object.values(byTag),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/sessions
// @desc    Create a session
router.post('/', protect, async (req, res) => {
  try {
    const { tag, timerMode, countdownMinutes, startTime, endTime, focusTime, breakTime } = req.body

    const session = await Session.create({
      user: req.user._id,
      tag,
      timerMode,
      countdownMinutes,
      startTime,
      endTime,
      focusTime,
      breakTime,
      completed: !!endTime,
    })

    const populated = await session.populate('tag', 'name color')
    res.status(201).json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/sessions/:id
// @desc    Update a session
router.put('/:id', protect, async (req, res) => {
  try {
    const { endTime, focusTime, breakTime, completed } = req.body

    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { endTime, focusTime, breakTime, completed },
      { new: true }
    ).populate('tag', 'name color')

    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    res.json(session)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/sessions/:id
// @desc    Delete a session
router.delete('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    res.json({ message: 'Session deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
