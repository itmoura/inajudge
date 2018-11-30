for ($i=0; $i -le 0; $i++)
{
    $proc = Start-Process -FilePath './public/test.exe' -RedirectStandardInput './public/input.txt' -RedirectStandardOutput './public/output.txt' -PassThru -WindowStyle Minimized
    $timeouted = 1
    $proc | Wait-Process -Timeout 4 -ErrorAction SilentlyContinue -ErrorVariable timeouted
    if ($timeouted){
        $proc.Kill()
    } elseif ($proc.ExitCode -ne 0){
    }
}


for ($i=0; $i -le 0; $i++){
    $data1 = Get-Date -format ss
    $test = Start-Process -FilePath "./test.exe" -RedirectStandardInput "./input.txt" -RedirectStandardOutput "./output.txt" -Wait
    $data2 = Get-Date -format ss
    $teste = $data2 - $data1
    Add-Content -Path "testeeeee.txt" -Value $teste
}
