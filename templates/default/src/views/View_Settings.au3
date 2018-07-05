#cs ----------------------------------------------------------------------------
GUI View Settings handler

AutoIt Version : 3.3.14.5
Author         : v20100v <7567933+v20100v@users.noreply.github.com>
Package        : autoit-gui-skeleton
Version        : 1.0
#ce ----------------------------------------------------------------------------


#include-once


;==============================================================================================================
; Create element for the 'Settings' view
;
; @param void
; @return void
;==============================================================================================================
Func _GUI_Init_View_Settings()
  ; Création du titre
  GUISetFont(16, 800, 0, "Arial Narrow")
  Global $label_title_settings = GUICtrlCreateLabel("Settings", 28, 16, 400)
  GUICtrlSetColor($label_title_settings, 0x85C4ED)
  GUICtrlSetBkColor($label_title_settings, $GUI_BKCOLOR_TRANSPARENT)

  Local $height = 100
  Local $heightStep = 30
  Local $margin_top = 50

  ; Proxy settings
  GUISetFont(9, 800, 0, "Arial")
  Local $height_group_proxy_settings = (5*$heightStep) + 30
  Global $group_proxy_settings = GUICtrlCreateGroup(" Proxy ", 30, $height-30, ($APP_WIDTH-60), $height_group_proxy_settings)
  GUISetFont(9, 400, 0, "Arial")
  Local $PROXY = IniRead($APP_PARAMETERS_INI, "AGS_HTTP_REQUEST", "PROXY", "NotFound")
  Local $RESOLVE_TIMEOUT = Int(IniRead($APP_PARAMETERS_INI, "AGS_HTTP_REQUEST", "RESOLVE_TIMEOUT", 0))
	Local $CONNECT_TIMEOUT = Int(IniRead($APP_PARAMETERS_INI, "AGS_HTTP_REQUEST", "CONNECT_TIMEOUT", 60000))
	Local $SEND_TIMEOUT = Int(IniRead($APP_PARAMETERS_INI, "AGS_HTTP_REQUEST", "SEND_TIMEOUT", 30000))
	Local $RECEIVE_TIMEOUT = Int(IniRead($APP_PARAMETERS_INI, "AGS_HTTP_REQUEST", "RECEIVE_TIMEOUT", 30000))
  Global $label_HTTP_Proxy = GUICtrlCreateLabel("HTTP / HTTPS Proxy", 50, $height)
  Global $input_HTTP_Proxy = GUICtrlCreateInput($PROXY, 200, $height-2, 400, 20)
  Global $label_HTTP_Resolve_Timeout = GUICtrlCreateLabel("Timeout for HTTP resolve", 50, $height + $heightStep)
  Global $input_HTTP_Resolve_Timeout = GUICtrlCreateInput($RESOLVE_TIMEOUT, 200, $height + $heightStep-2, 100, 20)
  Global $label_HTTP_Connect_Timeout = GUICtrlCreateLabel("Timeout for HTTP connect", 50, $height + 2*$heightStep)
  Global $input_HTTP_Connect_Timeout = GUICtrlCreateInput($CONNECT_TIMEOUT, 200, $height + 2*$heightStep - 2, 100, 20)
  Global $label_HTTP_Send_Timeout = GUICtrlCreateLabel("Timeout for HTTP send", 50, $height + 3*$heightStep)
  Global $input_HTTP_Send_Timeout = GUICtrlCreateInput($SEND_TIMEOUT, 200, $height + 3*$heightStep - 2, 100, 20)
  Global $label_HTTP_Receive_Timeout = GUICtrlCreateLabel("Timeout for HTTP receive", 50, $height + 4*$heightStep)
  Global $input_HTTP_Receive_Timeout = GUICtrlCreateInput($RECEIVE_TIMEOUT, 200, $height + 4*$heightStep - 2, 100, 20)
  GUICtrlCreateGroup("", -1, -1, 1, 1)

  ; Startup settings
  $height = $height + $height_group_proxy_settings
  GUISetFont(9, 800, 0, "Arial")
  Global $group_startup_settings = GUICtrlCreateGroup(" Start-up ", 30, $height, ($APP_WIDTH-60), (1*$heightStep) + 30)
  GUISetFont(9, 400, 0, "Arial")
  Global $checkbox_STARTUP_CHECK_UPDATE = GUICtrlCreateCheckbox( _
    "Search update on application startup ?", _
    50, $height + $heightStep, Default, 20, $BS_RIGHTBUTTON _
  )
  Local $LAUNCH_CHECK_FOR_UPDATE_ON_STARTUP = Int(IniRead($APP_PARAMETERS_INI, "AGS_CHECK_UPDATER", "LAUNCH_CHECK_FOR_UPDATE_ON_STARTUP", "NotFound"))
  If ( $LAUNCH_CHECK_FOR_UPDATE_ON_STARTUP = 1) Then
    GUICtrlSetState($checkbox_STARTUP_CHECK_UPDATE, $GUI_CHECKED)
  Else
    GUICtrlSetState($checkbox_STARTUP_CHECK_UPDATE, $GUI_UNCHECKED)
  EndIf
  GUICtrlCreateGroup("", -1, -1, 1, 1)

  Global $button_save_settings = GUICtrlCreateButton("Save", ($APP_WIDTH-150)/2, $APP_HEIGHT-100, 150)

  ; Setter of tips and cursors
  _GUI_SetCursorAndTip_View_Settings()

  ; Hide all elements by default
  _GUI_ShowHide_View_Settings($GUI_HIDE)
EndFunc


;==============================================================================================================
; Setter tips and cursor for elements in 'Settings' view
;
; @param void
; @return void
;==============================================================================================================
Func _GUI_SetCursorAndTip_View_Settings()
 GUICtrlSetCursor($label_HTTP_Proxy, 4)
 GUICtrlSetTip($label_HTTP_Proxy, @CRLF&"Configuration of proxy to allow internet connection"&@CRLF&@CRLF&"Example : http(s):\\myProxy.com:8080", "HTTP/HTTPS Proxy", 1)

 GUICtrlSetCursor($checkbox_STARTUP_CHECK_UPDATE, 4)
 GUICtrlSetTip($checkbox_STARTUP_CHECK_UPDATE, @CRLF&"To allow the search of an update of the application at each start."&@CRLF&"This search requires an internet connection, and therefore"&@CRLF&"potenially need a configuration of a proxy.", "Check for update on start-up", 1)

 GUICtrlSetCursor($button_save_settings, 0)
EndFunc


;==============================================================================================================
; Handler for display element on 'Settings' view
;
; @param {int} $action, use GUIConstantsEx $GUI_SHOW or $GUI_HIDE
; @return void
;==============================================================================================================
Func _GUI_ShowHide_View_Settings($action)
   Switch $action
	  Case $GUI_SHOW
		 _GUI_Hide_all_view()
		 ; Define here all elements to show when user come into this view
		 GUICtrlSetState($label_title_settings, $GUI_SHOW)
     GUICtrlSetState($group_proxy_settings, $GUI_SHOW)
     GUICtrlSetState($label_HTTP_Proxy, $GUI_SHOW)
     GUICtrlSetState($input_HTTP_Proxy, $GUI_SHOW)
     GUICtrlSetState($label_HTTP_Resolve_Timeout, $GUI_SHOW)
     GUICtrlSetState($input_HTTP_Resolve_Timeout, $GUI_SHOW)
     GUICtrlSetState($label_HTTP_Connect_Timeout, $GUI_SHOW)
     GUICtrlSetState($input_HTTP_Connect_Timeout, $GUI_SHOW)
     GUICtrlSetState($label_HTTP_Send_Timeout, $GUI_SHOW)
     GUICtrlSetState($input_HTTP_Send_Timeout, $GUI_SHOW)
     GUICtrlSetState($label_HTTP_Receive_Timeout, $GUI_SHOW)
     GUICtrlSetState($input_HTTP_Receive_Timeout, $GUI_SHOW)
     GUICtrlSetState($group_startup_settings, $GUI_SHOW)
     GUICtrlSetState($checkbox_STARTUP_CHECK_UPDATE, $GUI_SHOW)
     GUICtrlSetState($button_save_settings, $GUI_SHOW)

	  Case $GUI_HIDE
		 ; Define here all elements to hide when user leave this view
     GUICtrlSetState($label_title_settings, $GUI_HIDE)
     GUICtrlSetState($group_proxy_settings, $GUI_HIDE)
     GUICtrlSetState($label_HTTP_Proxy, $GUI_HIDE)
     GUICtrlSetState($input_HTTP_Proxy, $GUI_HIDE)
     GUICtrlSetState($label_HTTP_Resolve_Timeout, $GUI_HIDE)
     GUICtrlSetState($input_HTTP_Resolve_Timeout, $GUI_HIDE)
     GUICtrlSetState($label_HTTP_Connect_Timeout, $GUI_HIDE)
     GUICtrlSetState($input_HTTP_Connect_Timeout, $GUI_HIDE)
     GUICtrlSetState($label_HTTP_Send_Timeout, $GUI_HIDE)
     GUICtrlSetState($input_HTTP_Send_Timeout, $GUI_HIDE)
     GUICtrlSetState($label_HTTP_Receive_Timeout, $GUI_HIDE)
     GUICtrlSetState($input_HTTP_Receive_Timeout, $GUI_HIDE)
     GUICtrlSetState($group_startup_settings, $GUI_HIDE)
     GUICtrlSetState($checkbox_STARTUP_CHECK_UPDATE, $GUI_HIDE)
     GUICtrlSetState($button_save_settings, $GUI_HIDE)

	EndSwitch
 EndFunc



;==============================================================================================================
; Handler for events in 'Settings' view
;
; @param $msg, event return with GUIGetMsg method, i.e. the control ID of the control sending the message
; @return @void
;==============================================================================================================
Func _GUI_HandleEvents_View_Settings($msg)
   Switch $msg
	  Case $button_save_settings
		 ConsoleWrite('Click on "$button_save_settings"' & @CRLF)
     _save_parameters_ini()

   EndSwitch
EndFunc
