AGS-component-check-updater
===========================


## What is AGS-component-check-updater ?

The purpose of this component is to give the availability to keep up-to-date an AutoIt application built with AGS. AGS-component-check-updater is a subproject of AutoIt Gui Skeleton [AGS](https://v20100v.github.io/autoit-gui-skeleton/). AGS components are a set of AutoIt libraries, that you can use in our own applications.

It's an handler releases by compare a local version to a remote version store in a JSON file (RELEASES.json). This JSON file is saved on remote server, so to work it needs an internet connection to recover this JSON file, as well as a JSON parser in AutoIt. We use the implementation proposed by ward store in vendor folder to deal with JSON file.

More information about [AGS](https://v20100v.github.io/autoit-gui-skeleton/).
 


<br/>
   
## Methods
 
 
 Methods    | Description 
---------------|-------------
`json_decode_from_file($filePath)` | Decode JSON from a given local file.
`json_decode_from_url($jsonfileUrl, $proxy = "")` | Decode JSON from a given URL.
`RELEASES_JSON_get_all_versions($jsonObject)` | Parse all defined version(s) persisted in a decoded RELEASES.json file given.
`RELEASES_JSON_get_last_version($jsonObject)` | Get last version persisted in RELEASES.json
`CheckForUpdates($currentApplicationVersion, $remoteUrlReleasesJson, $proxy = "")` | Compare the current version with the last version persisted in an remote RELEASES.json file, in order to check if an update is available.
`_GUI_launch_CheckForUpdates($main_GUI, $context)` | Launch a check for updates. The build of a GUI exposing the results depends on the context when the check for update is launch : with an user interaction from menu or on startup application. We store the option to search update on starup in the configuration file `./config/parameters.ini` in parameter `LAUNCH_CHECK_FOR_UPDATE_ON_STARTUP`.
`_GUI_build_view_to_CheckForUpdates($main_GUI, $resultCheckForUpdate, $context = "")` | Create a child GUI use to expose the result of a check updater. It exposes if an update of current application is available. The child GUI is related to a given main GUI of application. If this method is execute on startup, we built this child GUI only if an update is available. And when this method is called by a user interaction, we built this child GUI in any case : no update available, new update or experimental.


  
<br/>
 
## Dependencies
  
> Specifiy if this AGS component have dependencies with an third-party library AutoIt or with an anoter AGS component. 
  
- AutoIt library dependencies :
  - JSON (https://www.autoitscript.com/forum/topic/148114-a-non-strict-json-udf-jsmn/)    
- AGS-components dependencies :
  - ags-component-http-request



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
