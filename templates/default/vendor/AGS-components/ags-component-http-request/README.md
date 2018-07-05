AGS-component-http-request
==========================


## What is AGS-component-http-request ?

It's an helper to send HTTP request in POST or GET method in an AutoIt project build with AGS. AGS-component-http-request is a subproject of AutoIt Gui Skeleton [AGS](https://v20100v.github.io/autoit-gui-skeleton/). AGS components are a set of AutoIt libraries, that you can use in our own applications.

 More information about [AGS](https://v20100v.github.io/autoit-gui-skeleton/).
 
 
 <br/>
   
 ## Methods
 
 
 Methods    | Description 
---------------|-------------
`HttpGET($url, $data = "", $proxy = "")` | Send HTTP request with GET method.
`HttpPOST($url, $data = "", $proxy = "")` | Send HTTP request with POST method.
`URLEncode($urlText)` | URL encoding replaces unsafe ASCII characters.  
`URLDecode($urlText)` | Inverse operation of URLEncode.
`WinHttp_SetProxy_from_configuration_file($oHttp)` | Set timeouts by parsing the configuration file AGS project store in './config/parameters.ini'.
`WinHttp_SetProxy_from_configuration_file($oHttp)` | Set proxy by parsing the configuration file AGS project store in './config/parameters.ini'.

  
 <br/>
 
  ## Dependencies
  
 > Specifiy if this AGS component have dependencies with an third-party library AutoIt or with an anoter AGS component. 
  
  - AutoIt library dependencies : none.
  - AGS-components dependencies : none.
  
 
 <br/>
 
 ## About
 
 ### Release history
 
  - AGS-component-http-request v1.0.0-alpha - *2018.07.04*
 
 
 <br/>
 
 ### Contributing
 
 Comments, pull-request & stars are always welcome !
 
 
 <br/>
 
 ### License
 
 Copyright (c) 2018 by [v20100v](https://github.com/v20100v). Released under the MIT license.
