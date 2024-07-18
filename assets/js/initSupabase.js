import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://mrkblizyydyvaxzqkwol.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ya2JsaXp5eWR5dmF4enFrd29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjExMDQwNTksImV4cCI6MjAzNjY4MDA1OX0.rzpBFvmCRRATCYpWXjZBjTCrkltFeqyPc7wyjK5SxEk'
export const supabase = createClient(supabaseUrl, supabaseKey)
export const user = await supabase.auth.getUser()

// add login and logout functions
export const login = async (email, password) => {
    const { user, error } = await supabase.auth.signIn({
        email,
        password,
    })
    if (error) throw error
    return user
}

export const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}



