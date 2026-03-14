(function() {
  const safeEnv = typeof process !== 'undefined' && process.env ? process.env : {};
  window.__APP_CONFIG__ = {
    SUPABASE_URL: safeEnv.SUPABASE_URL || "https://klnhjmbwtaijodvlsiff.supabase.co",
    SUPABASE_ANON_KEY: safeEnv.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbmhqbWJ3dGFpam9kdmxzaWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTMyMjQsImV4cCI6MjA4ODYyOTIyNH0.LRILFYE-S5t1M0rxZk2S6qiRCUBuai_t3kiRdGGdbyI"
  };
})();
