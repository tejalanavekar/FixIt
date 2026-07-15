// Verifies the Supabase access token sent as "Authorization: Bearer <token>" and attaches the user to the request.
import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/db'

export interface AuthedRequest extends Request {
  user?: { authId: string; email: string | undefined; dbId: string }
}

// OAuth sign-in (GitHub/Google) never inserts a row into `users` — only the email/password
// SignUpPage flow does. Auto-create it here so OAuth users can save sessions too.
async function getOrCreateDbUserId(authId: string, email: string | undefined): Promise<string> {
  const { data: existing } = await supabase.from('users').select('id').eq('auth_id', authId).maybeSingle()
  if (existing) return existing.id

  const username = `${(email?.split('@')[0] || 'user').slice(0, 24)}-${authId.slice(0, 8)}`
  const { data: created, error } = await supabase
    .from('users')
    .insert({ auth_id: authId, username, email: email ?? `${authId}@unknown.local` })
    .select('id')
    .single()

  if (error) throw error
  return created.id
}

export const requireAuth = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Missing access token' })
  }

  try {
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired session' })
    }

    const dbId = await getOrCreateDbUserId(data.user.id, data.user.email)
    req.user = { authId: data.user.id, email: data.user.email, dbId }
    next()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to resolve user profile' })
  }
}
