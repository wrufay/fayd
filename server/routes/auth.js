import express from 'express'
import passport from 'passport'
import { generateToken } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /auth/google
// @desc    Auth with Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

// @route   GET /auth/google/callback
// @desc    Google auth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req, res) => {
    const token = generateToken(req.user._id)
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}?token=${token}`)
  }
)

// @route   GET /auth/me
// @desc    Get current user
router.get('/me', (req, res) => {
  if (req.user) {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        dailyGoal: req.user.dailyGoal,
      },
    })
  } else {
    res.status(401).json({ message: 'Not authenticated' })
  }
})

// @route   POST /auth/logout
// @desc    Logout user
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' })
  })
})

export default router
