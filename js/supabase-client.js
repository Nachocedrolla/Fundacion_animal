// js/supabase-client.js
const SUPABASE_URL = 'https://uikfriddtmyddazyviqs.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpa2ZyaWRkdG15ZGRhenl2aXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MTgzMjksImV4cCI6MjA5NzI5NDMyOX0.8bykJH8pnmSeoK19sgxr5V6WdYGrl1vq_AHL8v_WJpA';

const { createClient } = supabase;
window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON);
