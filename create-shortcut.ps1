$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("C:\Users\Cjohannsen\Desktop\Grade-A-Beef.lnk")
$Shortcut.TargetPath = "C:\Users\Cjohannsen\Desktop\GradeABeef\GradeABeefProject\launcher.bat"
$Shortcut.WorkingDirectory = "C:\Users\Cjohannsen\Desktop\GradeABeef\GradeABeefProject"
$Shortcut.IconLocation = "C:\Windows\System32\shell32.dll,14"
$Shortcut.Description = "Launch Grade-A-Beef Lineman Tracker"
$Shortcut.WindowStyle = 1
$Shortcut.Save()
Write-Host "Desktop shortcut created: Grade-A-Beef.lnk"
