import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import passport from 'passport'
import connectDB from './config/db.js'
import configurePassport from './config/passport.js'
import authRoutes from './routes/auth.js'
import tagRoutes from './routes/tags.js'
import sessionRoutes from './routes/sessions.js'
import quickLinkRoutes from './routes/quicklinks.js'

// Load env vars
dotenv.config()

// Connect to database
connectDB()

// Configure passport
configurePassport()

const app = express()

// CORS - allow multiple origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json())
app.use(passport.initialize())

// Routes
app.use('/auth', authRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/quicklinks', quickLinkRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
