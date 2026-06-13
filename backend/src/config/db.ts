import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export const supabase =  createClient(
    env.supabaseUrl,
    env.supabaseServiceRoleKey
)

// createClient is basically an object to talk to the system or database in typescript