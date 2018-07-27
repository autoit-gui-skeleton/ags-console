#cs ----------------------------------------------------------------------------

Entry of all services.

@project        : {{ projectAGSName }}
@version        : v{{ projectAGSVersion }}
@author         : {{ authorName }} <{{authorEmail}}>
@AGS version    : v{{ AGSVersion }}
@AutoIt version : v{{ AutoItVersion }}

#ce ----------------------------------------------------------------------------


#include-once


; Includes services
#include './services/Dialogbox.au3'
#include './services/ParametersIni.au3'
