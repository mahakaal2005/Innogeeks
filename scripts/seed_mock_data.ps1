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

for ($i = 1; $i -le 5; $i++) {
    $Email = "android_member_$i@innogeeks.in"
    $Name = "Android Member $i"
    
    $AuthBody = @{
        email = $Email
        password = "password123"
        email_confirm = $true
        user_metadata = @{ name = $Name; domain = "android"; year = 2 }
    } | ConvertTo-Json

    Write-Host "Creating auth user $Email..."
    $AuthRes = Invoke-RestMethod -Uri "$Url/auth/v1/admin/users" -Method Post -Headers $Headers -Body $AuthBody -ErrorAction Stop
    $UserId = $AuthRes.id

    Start-Sleep -Seconds 1

    $ProfileBody = @{ domain = "android"; year = 2; role = "member" } | ConvertTo-Json
    Write-Host "Updating profile for $UserId..."
    Invoke-RestMethod -Uri "$Url/rest/v1/profiles?id=eq.$UserId" -Method Patch -Headers $Headers -Body $ProfileBody -ErrorAction Stop
}
Write-Host "Mock data successfully seeded!"
