import express from 'express'
import cors from 'cors'
import { env } from './config/env'
import { supabase } from './config/db'

const app = express()
app.use(cors(
    {
        origin: env.corsOrigin,
        credentials : true
    }
))
app.use(express.json()) 

app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) throw error

    res.json({
      status: 'ok',
      message: 'Backend is running',
      database: 'connected'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      database: 'disconnected'
    })
  }
})

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`)
})