import express from 'express'
import Tag from '../models/Tag.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/tags
// @desc    Get all tags for user
router.get('/', protect, async (req, res) => {
  try {
    const tags = await Tag.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(tags)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/tags
// @desc    Create a tag
router.post('/', protect, async (req, res) => {
  try {
    const { name, color } = req.body

    const tag = await Tag.create({
      user: req.user._id,
      name,
      color,
    })

    res.status(201).json(tag)
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Tag with this name already exists' })
    } else {
      res.status(500).json({ message: error.message })
    }
  }
})

// @route   PUT /api/tags/:id
// @desc    Update a tag
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, color } = req.body

    const tag = await Tag.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, color },
      { new: true }
    )

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' })
    }

    res.json(tag)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/tags/:id
// @desc    Delete a tag
router.delete('/:id', protect, async (req, res) => {
  try {
    const tag = await Tag.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' })
    }

    res.json({ message: 'Tag deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
