#cs ----------------------------------------------------------------------------

Main entry program of {%projectAGSName%}

This is the main entry of application. When the application is
started, the main GUI method is the first method called to build the user
interface and handle events and user interactions.

@project        : v{%projectAGSName%}
@version        : v{%projectAGSVersion%}
@author         : {%authorName%} <{%authorEmail%}>
@AGS version    : v{%AGSVersion%}
@AutoIt version : v{%AutoItVersion%}

#ce ----------------------------------------------------------------------------


Opt('MustDeclareVars', 1)


;-------------------------------------------------------------------------------
; Include all built-in AutoIt library requires
;-------------------------------------------------------------------------------
#include <IE.au3>
#include <GUIConstantsEx.au3>
#include <WinAPIDlg.au3>


;-------------------------------------------------------------------------------
; Include all third-party code in a project store in vendor directory
;
; By convention the directory `./vendor/` is the place where to conventionally
; store the code developed by third parties in a project.
;-------------------------------------------------------------------------------
#include 'vendor/GUICtrlOnHover/GUICtrlOnHover.au3'
#include 'vendor/JSON/JSON.au3'


;-------------------------------------------------------------------------------
; Include all third-party code for AGS components
;
; AGS components are a set of AutoIt libraries, that you can use in our own
; applications. You can choose to enable or disable its loading with comments.
; By convention the directory `./vendor/AGS-components` is the place where
; to conventionally store AGS components;
;-------------------------------------------------------------------------------
#include 'vendor/AGS-components/AGS_CheckUpdater.au3'
#include 'vendor/AGS-components/AGS_HttpRequest.au3'


;-------------------------------------------------------------------------------
; Include constants and global variables
;
; All constants and global variables are set in one place './src/GLOBALS.au3',
; With the exception to global variables of graphic elements which are set in
; each specific view file. Don't forget that constants can't longer change their
; value over time, unlike global variables.
;
; By convention, all global variables must be written in capital letter and
; separated by underscore - for example : Global Const $APP_EMAIL_CONTACT
;-------------------------------------------------------------------------------
#include './src/GLOBALS.au3'


;-------------------------------------------------------------------------------
; Include the main program that manages all the business code
;
; This is the entry point to business and logic code. This file can include
; another script store into './src/models/' folder, according to the needs of
; the application.
;-------------------------------------------------------------------------------
#include './src/BUSINESS.au3'


;-------------------------------------------------------------------------------
; Include the main program that manages all services
;
; This is the entry point to include all services. This file can include
; another service store into './src/services/' folder.
;-------------------------------------------------------------------------------
#include './src/SERVICES.au3'


;-------------------------------------------------------------------------------
; Include the main handler GUI
;
; It contains the _main_GUI() method which is only called by the main entry
; program. This method is designed to create the graphical user interface (GUI)
; and manage all user interactions and events.
;-------------------------------------------------------------------------------
#include './src/GUI.au3'


; Start the application
_main_GUI()
