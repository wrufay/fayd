import express from 'express'
import QuickLink from '../models/QuickLink.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/quicklinks
// @desc    Get all quick links for user
router.get('/', protect, async (req, res) => {
  try {
    const links = await QuickLink.find({ user: req.user._id }).sort({ order: 1 })
    res.json(links)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/quicklinks
// @desc    Create a quick link
router.post('/', protect, async (req, res) => {
  try {
    const { url, type, label } = req.body

    // Check if user already has 5 links
    const count = await QuickLink.countDocuments({ user: req.user._id })
    if (count >= 5) {
      return res.status(400).json({ message: 'Maximum 5 quick links allowed' })
    }

    const link = await QuickLink.create({
      user: req.user._id,
      url,
      type,
      label,
      order: count,
    })

    res.status(201).json(link)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/quicklinks/:id
// @desc    Delete a quick link
router.delete('/:id', protect, async (req, res) => {
  try {
    const link = await QuickLink.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!link) {
      return res.status(404).json({ message: 'Quick link not found' })
    }

    res.json({ message: 'Quick link deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/quicklinks/reorder
// @desc    Reorder quick links
router.put('/reorder', protect, async (req, res) => {
  try {
    const { order } = req.body // Array of link IDs in new order

    const updates = order.map((id, index) =>
      QuickLink.updateOne(
        { _id: id, user: req.user._id },
        { order: index }
      )
    )

    await Promise.all(updates)
    res.json({ message: 'Order updated' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
