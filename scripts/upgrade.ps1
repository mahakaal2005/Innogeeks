$EnvFile = 'D:\dev\Innogeeks\Innogeeks\.env'
$EnvVars = Get-Content $EnvFile | Where-Object { $_ -match '^([^=]+)=(.*)$' } | ForEach-Object {
    [PSCustomObject]@{ Name = $Matches[1].Trim(); Value = $Matches[2].Trim() }
}
$ServiceKey = ($EnvVars | Where-Object Name -eq 'SUPABASE_SERVICE_ROLE_KEY').Value
$Url = ($EnvVars | Where-Object Name -eq 'SUPABASE_URL').Value

$Headers = @{
    'apikey' = $ServiceKey
    'Authorization' = "Bearer $ServiceKey"
    'Content-Type' = 'application/json'
}

$ProfileBody = @{ role = 'coordinator' } | ConvertTo-Json
Write-Host 'Upgrading android_member_1 to coordinator...'
Invoke-RestMethod -Uri "$Url/rest/v1/profiles?email=eq.android_member_1@innogeeks.in" -Method Patch -Headers $Headers -Body $ProfileBody -ErrorAction Stop
Write-Host 'Done!'
