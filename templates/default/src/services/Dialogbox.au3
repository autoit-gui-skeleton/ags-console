#cs ----------------------------------------------------------------------------
Service for handling Windows dialog box

AutoIt Version : 3.3.14.5
Author         : v20100v <7567933+v20100v@users.noreply.github.com>
AGS-Package    : AGS version 1.0.0

#ce ----------------------------------------------------------------------------


;===========================================================================================================
; Creates an Open dialog box and show it to user, in order that he chooses a file in the Windows Explorer
;
; @params void
; @return $result (array)
;     -> $result[0] = the file path
;     -> $result[1] = the file name
;===========================================================================================================
Func SERVICES_Dialogbox_open_file()
	Local $fileInfo = _WinAPI_GetOpenFileName("Open file", "*.*", @WorkingDir, "", _
			"", 2, BitOR($OFN_ALLOWMULTISELECT, $OFN_EXPLORER), $OFN_EX_NOPLACESBAR)
	Local $result[2]

	If @error Then
		$result[0] = -1
		$result[1] = -1
	Else
		; The file path
		$result[0] = $fileInfo[1] & "\" & $fileInfo[2]
		; The file name
		$result[1] = $fileInfo[2]
	EndIf

	Return $result
EndFunc
