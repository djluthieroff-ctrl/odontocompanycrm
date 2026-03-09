param(
    [Parameter(Mandatory = $true)]
    [string]$SupabaseUrl,

    [Parameter(Mandatory = $true)]
    [string]$SupabaseAnonKey
)

$base = "$SupabaseUrl/rest/v1"
$h = @{
    apikey        = $SupabaseAnonKey
    Authorization = "Bearer $SupabaseAnonKey"
}

Write-Output "=== Checking Supabase tables ==="
Write-Output "URL: $SupabaseUrl"

try {
    $leads = Invoke-RestMethod -Uri "$base/leads?select=id,name&limit=3" -Headers $h
    Write-Output "Leads: $($leads.Count) records found"
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
