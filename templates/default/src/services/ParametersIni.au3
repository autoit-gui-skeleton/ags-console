#cs ----------------------------------------------------------------------------
Service for save values in parameters.ini

AutoIt Version : 3.3.14.5
Author         : v20100v <7567933+v20100v@users.noreply.github.com>
AGS-Package    : AGS version 1.0.0

#ce ----------------------------------------------------------------------------


;===========================================================================================================
; Save values choose by user in 'Setting' views, and launch with 'save' button
;
; @params void
; @return void
;===========================================================================================================
Func _save_parameters_ini()

	; Save proxy settings
	IniWrite($APP_PARAMETERS_INI, "AGS_HTTP_REQUEST", "PROXY", GUICtrlRead($input_HTTP_Proxy))
	IniWrite($APP_PARAMETERS_INI, "AGS_HTTP_REQUEST", "RESOLVE_TIMEOUT", GUICtrlRead($input_HTTP_Resolve_Timeout))
	IniWrite($APP_PARAMETERS_INI, "AGS_HTTP_REQUEST", "CONNECT_TIMEOUT", GUICtrlRead($input_HTTP_Connect_Timeout))
	IniWrite($APP_PARAMETERS_INI, "AGS_HTTP_REQUEST", "SEND_TIMEOUT", GUICtrlRead($input_HTTP_Send_Timeout))
	IniWrite($APP_PARAMETERS_INI, "AGS_HTTP_REQUEST", "RECEIVE_TIMEOUT", GUICtrlRead($input_HTTP_Receive_Timeout))

	; Startup settings
	If (GUICtrlRead($checkbox_STARTUP_CHECK_UPDATE) = $GUI_CHECKED) Then
		IniWrite($APP_PARAMETERS_INI, "AGS_CHECK_FOR_UPDATES", "LAUNCH_CHECK_FOR_UPDATE_ON_STARTUP", "1")
	Else
		IniWrite($APP_PARAMETERS_INI, "AGS_CHECK_FOR_UPDATES", "LAUNCH_CHECK_FOR_UPDATE_ON_STARTUP", "0")
	EndIf
EndFunc
