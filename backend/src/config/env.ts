import dotenv from 'dotenv'
dotenv.config()

export const env = {
    supabaseUrl : process.env.SUPABASE_URL!,
    supabaseAnonKey : process.env.SUPABASE_ANON_KEY!,
    supabaseServiceRoleKey : process.env.SUPABASE_SERVICE_ROLE_KEY!,
    groqApiKey : process.env.GROQ_API_KEY!,
    port : process.env.PORT || '5000',
    jwtSecret : process.env.JWT_SECRET!,
    corsOrigin : process.env.CORS_ORIGIN || 'http://localhost:5173',
}

// In frontend we use import.meta.env to access environment variables 
// In backend we use process.env to access environment variables

//!is non null assertion stating it wont be undefined
// typescript has the feature as string | undefined so we specfiying it will be non null