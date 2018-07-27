::------------------------------------------------------------------------------
::
::    Copyright © 2018-05
::
::    AGS packager is used to generate Windows installer package (setup) with
::    InnoSetup solution, and by parsing the package.json file which describe
::    the project and its dependencies.
::
::    @name           : AGS-packager
::    @version        : 1.1.0
::    @AGS framework  : v1.0.0
::    @authors        : 20100 <vb20100bv@gmail.com>
::
::------------------------------------------------------------------------------


:: Splashscreen
::------------------------------------------------------------------------------
@echo off


:: Parse batch arguments
set ROOT_FOLDER=%1
set JSON_FILE=%ROOT_FOLDER%\package.json
set BIN_DIRECTORY=%2
IF [%ROOT_FOLDER%] == [] (
    echo Error, you must give the root folder of your AGS project where package.json is stored.>&2
    exit /B 1
)
IF NOT EXIST "%JSON_FILE%" (
    ECHO Error, the package.json file '%JSON_FILE%' does not exist.>&2
    EXIT /B 1
)
IF [%BIN_DIRECTORY%] == [] (
    echo Error, you must give the __dirname as second argument. >&2
    exit /B 1
)


type %BIN_DIRECTORY%\ags-packager-copyright
echo.


:: Set packagers's variables
echo  _____________________________________
echo :                                     :
echo :  Step 1 - Set packager's variables  :
echo :_____________________________________:
echo.

:: Set path
set JQ="%BIN_DIRECTORY%\jq-win64.exe" -r
set FOLDER_CURRENT=%cd%
set FOLDER_SRC=%ROOT_FOLDER%\src
set ISCC_CLI="C:\Program Files (x86)\Inno Setup 5\ISCC.exe"
set ISCC_SCRIPT="%BIN_DIRECTORY%\AGS-packager.iss"
set ZIP_CLI="C:\Program Files\7-Zip\7z.exe"

echo -[ AGS packager's variables ]-
echo.
echo * ROOT_FOLDER    = %ROOT_FOLDER%
echo * JSON_FILE      = %JSON_FILE%
echo * BIN_DIRECTORY  = %BIN_DIRECTORY%
echo * FOLDER_CURRENT = %FOLDER_CURRENT%
echo * FOLDER_SRC     = %FOLDER_SRC%
echo * JQ             = %JQ%
echo * ISCC_CLI       = %ISCC_CLI%
echo * ISCC_SCRIPT    = %ISCC_SCRIPT%
echo * ZIP_CLI        = %ZIP_CLI%
echo.

echo * Attempt to parsed "%JSON_FILE%" with JQ
call:parserJson %JSON_FILE% .version PACKAGE_VERSION
call:parserJson %JSON_FILE% .name PACKAGE_NAME
call:parserJson %JSON_FILE% .homepage PACKAGE_HOMEPAGE
call:parserJson %JSON_FILE% .AGS.application.main PACKAGE_AGS_MAIN
call:parserJson %JSON_FILE% .AGS.application.corporate PACKAGE_CORPORATE
call:parserJson %JSON_FILE% .AGS.application.contact PACKAGE_CONTACT

echo * Parsed package.json is finished
echo.

set NAME_EXE=%PACKAGE_NAME%_v%PACKAGE_VERSION%.exe
set FOLDER_OUT=%ROOT_FOLDER%\releases\v%PACKAGE_VERSION%\%PACKAGE_NAME%_v%PACKAGE_VERSION%
set AUT2EXE="C:\Program Files (x86)\AutoIt3\Aut2Exe\Aut2exe.exe"
set AUT2EXE_ICON=%ROOT_FOLDER%\assets\images\myApplication.ico
set AUT2EXE_ARGS=/in "%ROOT_FOLDER%\%PACKAGE_AGS_MAIN%" /out "%FOLDER_OUT%\%NAME_EXE%" /icon "%AUT2EXE_ICON%"
@echo off
setlocal EnableExtensions
for /f " tokens=2-4 delims=-./ " %%D in ( "%date%" ) do ( if %%D gtr 31 ( set "PACKAGE_YEAR=%%D" ) else ( if %%E gtr 31 ( set "PACKAGE_YEAR=%%E" ) else ( if %%F gtr 31 ( set "PACKAGE_YEAR=%%F" ) ) ) )
endlocal

echo * PACKAGE_VERSION   = %PACKAGE_VERSION%
echo * PACKAGE_NAME      = %PACKAGE_NAME%
echo * PACKAGE_AGS_MAIN  = %PACKAGE_AGS_MAIN%
echo * PACKAGE_CORPORATE = %PACKAGE_CORPORATE%
echo * PACKAGE_CONTACT   = %PACKAGE_CONTACT%
echo * PACKAGE_YEAR      = %PACKAGE_YEAR%
echo * NAME_EXE          = %NAME_EXE%
echo * FOLDER_OUT        = %FOLDER_OUT%
echo * AUT2EXE           = %AUT2EXE%
echo * AUT2EXE_ICON      = %AUT2EXE_ICON%
echo * AUT2EXE_ARGS      = %AUT2EXE_ARGS%


echo.


echo  ______________________________________
echo :                                      :
echo :  Step 2 - Creating output directory  :
echo :______________________________________:
echo.

echo * Attempt to create : "%ROOT_FOLDER%\releases"
cd %ROOT_FOLDER%
mkdir releases
cd releases
echo * Attempt to create : "%ROOT_FOLDER%\releases\v%PACKAGE_VERSION%\"
mkdir v%PACKAGE_VERSION%
cd v%PACKAGE_VERSION%
echo * Attempt to create : "%ROOT_FOLDER%\releases\v%PACKAGE_VERSION%\%PACKAGE_NAME%_v%PACKAGE_VERSION%\"
mkdir %PACKAGE_NAME%_v%PACKAGE_VERSION%
echo * Creating output directories is finished.
cd %FOLDER_CURRENT%


echo.


echo  _______________________________
echo :                               :
echo :  Step 3 - AutoIt compilation  :
echo :_______________________________:
echo.
echo * Perform AutoIt compilation with aut2exe and AUT2EXE_ARGS.
cd %ROOT_FOLDER%
echo * Attempt to compil : %AUT2EXE% %AUT2EXE_ARGS%
%AUT2EXE% %AUT2EXE_ARGS%
echo * Compilation AutoIt is finished.


echo.


echo  ______________________________
echo :                              :
echo :  Step 4 - Copy assets files  :
echo :______________________________:
echo.
cd %ROOT_FOLDER%
echo * Create the file xcopy_Exclude.txt in order to ignore some files and directories.
echo .au3 > xcopy_Exclude.txt
echo /releases/ >> xcopy_Exclude.txt
echo /src/ >> xcopy_Exclude.txt
echo /vendor/ >> xcopy_Exclude.txt
echo * The file xcopy_Exclude.txt is created.
echo.
echo * Perform the copy of additional files store in assets, config, docs directories
xcopy "%ROOT_FOLDER%\assets" "%FOLDER_OUT%\assets\" /E /H /Y /EXCLUDE:xcopy_Exclude.txt
xcopy "%ROOT_FOLDER%\config" "%FOLDER_OUT%\config\" /E /H /Y /EXCLUDE:xcopy_Exclude.txt
xcopy "%ROOT_FOLDER%\docs" "%FOLDER_OUT%\docs\" /E /H /Y /EXCLUDE:xcopy_Exclude.txt
@copy "%ROOT_FOLDER%\package.json" "%FOLDER_OUT%\package.json" /Y > log
echo "%ROOT_FOLDER%\package.json" is copied.
@copy "%ROOT_FOLDER%\README.md" "%FOLDER_OUT%\README.md" /Y > log
echo "%ROOT_FOLDER%\README.md" is copied.
echo * Ok all files and directory are copied.
echo.
echo * Delete xcopy_Exclude.txt.
del xcopy_Exclude.txt
del log


echo.


echo  ______________________________________
echo :                                      :
echo :  Step 5 - Generate additional files  :
echo :______________________________________:
echo.
echo * Create file ".v%PACKAGE_VERSION%" in FOLDER_OUT.
cd %FOLDER_OUT%
echo Last compilation of application %PACKAGE_NAME% version %PACKAGE_VERSION% the %date% at %time% > .v%PACKAGE_VERSION%
echo * This file has been created.


echo.


echo  _________________________________
echo :                                 :
echo :  Step 6 - Generate zip archive  :
echo :_________________________________:
echo.
echo * Move in the folder %FOLDER_CURRENT%\v%PACKAGE_VERSION%
cd %ROOT_FOLDER%\releases\v%PACKAGE_VERSION%
echo * Zip the folder %PACKAGE_NAME%_v%PACKAGE_VERSION%
%ZIP_CLI% a -tzip %PACKAGE_NAME%_v%PACKAGE_VERSION%.zip "%PACKAGE_NAME%_v%PACKAGE_VERSION%
echo * The zip has been created.


echo.


echo  ____________________________________________________________________
echo :                                                                    :
echo :  Step 7 - Generate Windows installer package with ISS compilation  :
echo :____________________________________________________________________:
echo.
cd %BIN_DIRECTORY%
echo * Launch InnoSetup compilation with ISCC script
echo * %ISCC_CLI% %ISCC_SCRIPT% /dAppVersion=%PACKAGE_VERSION% /dAppName=%PACKAGE_NAME% /dRootFolder=%ROOT_FOLDER% /dAppCorporate=%PACKAGE_CORPORATE% /dAppHomepage=%PACKAGE_HOMEPAGE% /dYear=%Date:~10,4%
%ISCC_CLI% %ISCC_SCRIPT% /dAppVersion=%PACKAGE_VERSION% /dAppName=%PACKAGE_NAME% /dRootFolder=%ROOT_FOLDER% /dAppCorporate=%PACKAGE_CORPORATE% /dAppHomepage=%PACKAGE_HOMEPAGE% /dAppContact=%PACKAGE_CONTACT% /dYear=%PACKAGE_YEAR%
echo.
echo * Compilation has been finished.


echo.


echo  __________________________________
echo :                                  :
echo :  Step 8 - Delete tempory folder  :
echo :__________________________________:
echo.
echo * Try to delete tempory folder use for ISS compilation
cd %ROOT_FOLDER%
echo * Delete the folder %ROOT_FOLDER%\releases\v%PACKAGE_VERSION%\%PACKAGE_NAME%_v%PACKAGE_VERSION%\
rmdir %ROOT_FOLDER%\releases\v%PACKAGE_VERSION%\%PACKAGE_NAME%_v%PACKAGE_VERSION% /S /Q
cd %FOLDER_CURRENT%


echo.


echo  ______________________
echo :                      :
echo :  END - AGS Packager  :
echo :______________________:
echo.


:: Force execution to quit at the end of the "main" logic
EXIT /B %ERRORLEVEL%


:: ---
:: Parse a given JSON file, select a property with jq filter and set into a global variable
::
:: @param %~1, the JSON file to parsed
:: @param %~2, the jq filter to use for select JSON value
:: @param %~3, the name of the global variable to set
:: ---
:parserJson
type %~1 | %JQ% %~2 > temp
set /p %~3=<temp
del temp
EXIT /B 0