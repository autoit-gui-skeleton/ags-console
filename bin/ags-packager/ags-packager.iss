;------------------------------------------------------------------------------
;
;    Copyright © 2018-05
;
;    AGS packager is used to generate Windows installer package (setup) with
;    InnoSetup solution, and by parsing the package.json file which describe
;    the project and its dependencies.
;
;    @name           : AGS-packager
;    @version        : 1.1.0
;    @AGS framework  : v1.0.0
;    @authors        : 20100 <vb20100bv@gmail.com>
;
;------------------------------------------------------------------------------

; Theses variables are defined into the Windows batch program ags-packager.bat. They are given in this script with
; the InnoSetupCommandLineCompiler (iscc) by using the command /d<name>[=<value>]. Variables available are :
;  -> /dAppVersion
;  -> /dAppName
;  -> /dRootFolder
;  -> /dAppCorporate
;  -> /dAppHomepage
;  -> /dAppContact
;  -> /dYear

#define AppExeName AppName+"_v" + AppVersion + ".exe"
#define AppURL AppHomepage
#define AppCopyright "Copyright (C) "+ Year + ", " + AppCorporate
#define PathRelease RootFolder + "\releases\v" + AppVersion + "\"+AppName+"_v" + AppVersion
#define PathOutput RootFolder + "\releases\v" + AppVersion + "\"
#define PathAssets RootFolder + "\assets"

; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
#define AppGUID "1800A519-17E4-494D-9896-72842AC5BE22"
#define AppID AppCorporate + "_" + AppGUID

[Setup]
AppId={#AppID}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppCorporate}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}
AppCopyright={#AppCopyright}
DefaultDirName={sd}\{#AppCorporate}\{#AppName}
DefaultGroupName={#AppCorporate}\{#AppName}
LicenseFile={#PathAssets}\setup\LICENSE.txt
InfoBeforeFile={#PathAssets}\setup\BEFORE_INSTALL.txt
InfoAfterFile={#PathAssets}\setup\AFTER_INSTALL.txt
OutputDir={#PathOutput}\
OutputBaseFilename=Setup_{#AppName}_v{#AppVersion}
Compression=lzma2/fast
SolidCompression=yes
AppContact={#AppContact}
UninstallDisplayIcon={app}\assets\images\myApplication.ico
WizardImageFile={#PathAssets}\setup\innosetup_background.bmp
WizardImageStretch=no
WizardSmallImageFile={#PathAssets}\setup\innosetup_image.bmp
SetupIconFile={#PathAssets}\setup\setup.ico
BackColor=$FFFF00
VersionInfoVersion={#AppVersion}

; Make this setup program work with 32-bit and 64-bit Windows
ArchitecturesAllowed=x86 x64
ArchitecturesInstallIn64BitMode=x64


[Languages]
Name: "en"; MessagesFile: compiler:Default.isl;
Name: "french"; MessagesFile: "compiler:Languages\French.isl"

[CustomMessages]
french.CheckInstall=est déjà installé sur ce PC.
french.CheckInstallAction=Souhaitez-vous désinstaller cette version existante avant de poursuivre?
en.CheckInstall=is already install on this PC.
en.CheckInstallAction=Do you want to uninstall this existing version before continuing?

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}";

[Files]
Source: "{#PathRelease}\{#AppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#PathRelease}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
                                                                          
[Icons]
Name: "{group}\{#AppName}"; Filename: "{app}\{#AppExeName}"; IconFilename: {app}\assets\images\myApplication.ico;
Name: "{group}\{cm:ProgramOnTheWeb,{#AppName}}"; Filename: "{#AppURL}";
Name: "{group}\{cm:UninstallProgram,{#AppName}}"; Filename: "{uninstallexe}"; IconFilename: {app}\assets\images\setup.ico;
Name: "{commondesktop}\{#AppName}"; Filename: "{app}\{#AppExeName}"; IconFilename: {app}\assets\images\myApplication.ico; IconIndex: 0

[Run]
Filename: "{app}\{#AppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(AppName, '&', '&&')}}"; Flags: shellexec postinstall skipifsilent

[Registry]
Root: HKCR; Subkey: {#AppName}Application; ValueType: string; ValueName: ; ValueData: Program {#AppName}; Flags: uninsdeletekey
Root: HKCR; Subkey: {#AppName}Application\DefaultIcon; ValueType: string; ValueName: ; ValueData: {app}\{#AppExeName},0; Flags: uninsdeletevalue
Root: HKCR; Subkey: {#AppName}Application\shell\open\command; ValueType: string; ValueName: ; ValueData: """{app}\{#AppExeName}"" ""%1"""; Flags: uninsdeletevalue

[Code]
function InitializeSetup(): Boolean;
var
  ResultCode: Integer;
  ResultStr:string;
begin
  // Check if the application is already install
  // MsgBox('AppID = ' + '{#AppID}', mbInformation, mb_Ok);
  begin
    If RegQueryStringValue(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{#AppID}_is1', 'UninstallString', ResultStr) then begin
      If ResultStr<>'' then begin
        ResultStr:=RemoveQuotes(ResultStr);
          if MsgBox('{#AppName} ' + ExpandConstant('{cm:CheckInstall}') + #13#13 + ExpandConstant('{cm:CheckInstallAction}'), mbConfirmation, MB_YESNO) = idYes then
          if not Exec(ResultStr, '/silent', '', SW_SHOW, ewWaitUntilTerminated, ResultCode) then
            MsgBox('Erreur !!! ' #13#13 '' + SysErrorMessage(ResultCode) + '.', mbError, MB_OK);
      end;
    end;
  end ;
  Result := True;
end;

procedure InitializeWizard();
var
  WLabel1, WLabel2 : TLabel;
begin
  WizardForm.WelcomeLabel1.Hide;
  WizardForm.WelcomeLabel2.Hide;
  WizardForm.FinishedHeadingLabel.Hide;

  WizardForm.WizardBitmapImage.Width := 500;
  WizardForm.WizardBitmapImage.Height := 315;

  WLabel1 := TLabel.Create(WizardForm);
  WLabel1.Left := ScaleX(176); 
  WLabel1.Top := ScaleY(16);
  WLabel1.Width := ScaleX(301); 
  WLabel1.Height := ScaleY(54); 
  WLabel1.AutoSize := False;
  WLabel1.WordWrap := True;
  WLabel1.Font.Name := 'tahoma'; 
  WLabel1.Font.Size := 12; 
  WLabel1.Font.Style := [fsBold];
  WLabel1.Font.Color:= clBlack; 
  WLabel1.ShowAccelChar := False;
  WLabel1.Caption := WizardForm.WelcomeLabel1.Caption;
  WLabel1.Transparent := True;
  WLabel1.Parent := WizardForm.WelcomePage;
  WLabel1.Hide;

  WLabel2 :=TLabel.Create(WizardForm);
  WLabel2.Left := ScaleX(176); 
  WLabel2.Top := ScaleY(136);
  WLabel2.Width := ScaleX(301); 
  WLabel2.Height := ScaleY(234); 
  WLabel2.AutoSize := False;
  WLabel2.WordWrap := True;
  WLabel2.Font.Name := 'tahoma'; 
  WLabel2.Font.Color:= clBlack; 
  WLabel2.ShowAccelChar := False;
  WLabel2.Caption := WizardForm.WelcomeLabel2.Caption;
  WLabel2.Transparent := True;
  WLabel2.Parent := WizardForm.WelcomePage;

  WizardForm.WizardBitmapImage2.Width := 500; 
  WizardForm.WizardBitmapImage2.Height := 315; 

  WizardForm.FinishedLabel.Left := ScaleX(176);
  WizardForm.FinishedLabel.Top := ScaleY(116);
end;

procedure CurPageChanged(CurPageID: Integer);
begin
  // you must do this as late as possible, because the RunList is being modified
  // after installation; so this will check if there's at least one item in the
  // RunList and then set to the first item (indexing starts at 0) Enabled state
  // to False
  if (CurPageID = wpFinished) then    
    //WizardForm.RunList.Visible := False;
    WizardForm.RunList.Left := ScaleX(176);
    WizardForm.RunList.Top := ScaleY(214);
end;