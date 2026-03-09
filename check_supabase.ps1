$apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdHR6bXpuZndrbmVqbndqZHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDQ2NjIsImV4cCI6MjA4NzE4MDY2Mn0.fGAVN3823nXVPUuS2ISJzf9BGFJny2fviwLWgP4i6LU'
$base = 'https://nattzmznfwknejnwjdrd.supabase.co/rest/v1'
$h = @{apikey=$apikey}

Write-Output "=== Checking Supabase tables ==="

try {
    $leads = Invoke-RestMethod -Uri "$base/leads?select=id,name&limit=3" -Headers $h
    Write-Output "Leads: $($leads.Count) records found"
    if ($leads.Count -gt 0) { $leads | Format-Table }
} catch {
    Write-Output "Leads error: $($_.Exception.Message)"
}

try {
    $patients = Invoke-RestMethod -Uri "$base/patients?select=id,name&limit=3" -Headers $h
    Write-Output "Patients: $($patients.Count) records found"
} catch {
    Write-Output "Patients error: $($_.Exception.Message)"
}

try {
    $appointments = Invoke-RestMethod -Uri "$base/appointments?select=id,patient_name&limit=3" -Headers $h
    Write-Output "Appointments: $($appointments.Count) records found"
} catch {
    Write-Output "Appointments error: $($_.Exception.Message)"
}
