// Supabase client setup for Twister
const SUPABASE_URL = "https://mhmmhaosmcrhuazmksqq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obW1oYW9zbWNyaHVhem1rc3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTI2NjUsImV4cCI6MjA3NDMyODY2NX0.kqRLnyfoVUcF7oIHo0-_rx7TJwZQCUDy0HTyaqvp6tM";

// Load Supabase client from CDN if not present
if (typeof window.createClient === 'undefined') {
  const script = document.createElement('script');
  script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
  script.type = "module";
  document.head.appendChild(script);
}

// Wait for Supabase to be available, then initialize
window.addEventListener('DOMContentLoaded', () => {
  if (!window.supabase && window.createClient) {
    window.supabase = window.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
});


