#cs ----------------------------------------------------------------------------

Defines application constants and variables declared in global scope.

All constants and global variables are set in one place './src/GLOBALS.au3',
With the exception to global variables of graphic elements which are set in
each specific view file. Don't forget that constants can't longer change their
value over time, unlike global variables.

By convention, all global variables must be written in capital letter and
separated by underscore - for example : Global Const $APP_EMAIL_CONTACT

AutoIt Version : 3.3.14.5
Author         : v20100v <7567933+v20100v@users.noreply.github.com>
AGS-Package    : AGS version 1.0.0

#ce ----------------------------------------------------------------------------


#include-once


;-------------------------------------------------------------------------------
; Application helper alias
;-------------------------------------------------------------------------------
Global Const $APP_FOLDER_ROOT = @ScriptDir & "/../"
Global Const $APP_FOLDER_ASSETS = @ScriptDir & "/assets"


;-------------------------------------------------------------------------------
; Application parameters
;-------------------------------------------------------------------------------
Global Const $APP_PARAMETERS_INI = @ScriptDir & "/config/parameters.ini"
Local $fileExists = FileExists($APP_PARAMETERS_INI)
If Not $fileExists Then
	MsgBox(16, "Error with load parameters.ini", "Unable to find the file './config/parameters.ini'! " & @CRLF & "This application can not work, you must create this file.")
EndIf


;-------------------------------------------------------------------------------
; Application main constants
;-------------------------------------------------------------------------------
Global Const $APP_NAME = "myApplication"
Global Const $APP_VERSION = "1.1.0"
Global Const $APP_WEBSITE = "https://myApplication-website.org"
Global Const $APP_EMAIL_CONTACT = "myApplication@website.org"
Global Const $APP_ID = "acme.myApplication"
Global Const $APP_LIFE_PERIOD = "2018-" & @YEAR
Global Const $APP_COPYRIGHT = "© " & $APP_LIFE_PERIOD & ", A.C.M.E."


;-------------------------------------------------------------------------------
; Application GUI constants
;-------------------------------------------------------------------------------
Global Const $APP_WIDTH = 800
Global Const $APP_HEIGHT = 600
Global Const $APP_GUI_TITLE_COLOR = 0x85C4ED
Global Const $APP_GUI_LINK_COLOR = 0x5487FB


;-------------------------------------------------------------------------------
; AGS-compontents Check Updater constants
;-------------------------------------------------------------------------------
; Repository JSON use to check for updates. This json file must persist in a remote server available via internet,
; and without restriction. For example you wan use Github to host it.
Global Const $APP_REMOTE_RELEASES_JSON = "https://raw.githubusercontent.com/v20100v/autoit-gui-skeleton/develop/source/AGS-example-002___check-for-update/RELEASES.json"


;-------------------------------------------------------------------------------
; Custom application global variable
;
; Here is an example to defined custom global variables
;-------------------------------------------------------------------------------
Global $OPEN_FILE = False
Global $OPEN_FILE_PATH = -1
Global $OPEN_FILE_NAME = -1

