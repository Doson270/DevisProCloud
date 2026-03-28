// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cdrcqmlluhkpwofgasqu.supabase.co'
const supabaseKey = 'sb_publishable_sbW3Sa0EO9lVVQ4Gsk-R_Q_tKDoJuAn'

export const supabase = createClient(supabaseUrl, supabaseKey)