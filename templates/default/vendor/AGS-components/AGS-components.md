# AGS components

AGS components are a set of AutoIt libraries, that you can use in our own applications.

 Components    | Description | Dependencies
---------------|-------------|-------------
`CheckUpdater` | Handler releases by compare a local version to a remote version store in a JSON file (RELEASES.json). This JSON file is saved on remote server, so to work it needs an internet connection to recover this JSON file, as well as a JSON parser in AutoIt. We use the implementation proposed by ward store in vendor folder to deal with JSON file. | `HttpRequest`
`HttpRequest`  | Helper to send HTTP request in POST or GET method. | None
