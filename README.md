AGS console commands
====================


> AGS provides lots of commands ./bin/ags.bat created in the Node.js ecosystem. You can also customize and create your own commands to help your production with a simply task manager.




# Requirements for AGS console commands

## Install `Node.js`

We will use [Node.js](https://nodejs.org/) as an environment for developers, and we take benefits of its tools.

First we assume that you have installed [Node.js](https://nodejs.org/). If it's not case, we can go to the website [Node.js](https://nodejs.org/), donwload and execute the setup... or you can take a [chocolatey](https://chocolatey.org/) !!! As THE package manager for Windows, Chocolatey easily manage all aspects of Windows software (installation, configuration, upgrade, and uninstallation). If we don't know it, you can find here the documentation to install it : [https://chocolatey.org/install](https://chocolatey.org/install)

Run your prefered windows command ; cmd, cmder or powershell ; as an administrator and type:

```bash
λ choco install nodejs
```

## Install `yarn`

We use [Yarn](https://yarnpkg.com/en/docs/install#windows-stable) as a package manager for code, instead of npm. Once you have Chocolatey installed, you may install yarn by running the following code in your console. This will also ensure that you have Node.js installed.

```bash
λ choco install yarn
```



# Develop and extends AGS console 

## Running the application locally with index.js

To run this application locally, just execute the main entry program index.js on root folder. But with this approach, you only can execute this program on root folder. To do this, type:

```bash
λ node index.js
```


## Running the application locally as a global npm module

Since you’re developing the generator locally, it’s not yet available as a global npm module. From the root of your generator project (in the generator-name/ folder), type:

```bash
λ yarn link
```

That will install your project dependencies and symlink a global module to your local file. After npm is done, you’ll be able to call this console application

```bash
λ ags

  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║  AGS Console                                              ║
  ║  v1.0.0                                                   ║
  ║                                                           ║
  ║  Console commands for AGS (AutoIt GUI Skeleton) project.  ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝

   USAGE

     ags <command> [options]

   COMMANDS

     new <name>          Create a new AGS project.
     clean               Clean all AutoIt code source.
     setup               Create a windows setup of project.
     help <command>      Display help for a specific command

   GLOBAL OPTIONS

     -h, --help         Display help
     -V, --version      Display version
     --no-color         Disable colors
     --quiet            Quiet mode - only displays warn and error messages
     -v, --verbose      Verbose mode - will also output debug messages
```


## How to package AGS console into an independant executable ?

In order to package this application, we use [pkg.js](https://github.com/zeit/pkg). It give us a CLI tool which is able to package a Node.js project into an executable that can be run even on devices without Node.js installed.

As you can see on its description, pkg.js can:

 - Instantly make executables for other platforms (cross-compilation)
 - Make some kind of self-extracting archive or installer
 - No need to install Node.js and npm to run the packaged application
 - No need to download hundreds of files via npm install to deploy your application. Deploy it as a single file
 - Put your assets inside the executable to make it even more portable

To make this executable, you must install node dependencies developpement defines in package.json, or install manually pkg as a global node module with :

```bash
λ yarn global add pkg
```

To launch the build, you can use alias define in package.json:

```bash
λ npm run pkg
λ npm run package-x86
λ npm run package-x64
```

This command will create the binary `Ags.exe` into `./build` directory.




## How to create a new command for AGS console ?

To do this

 - Create a new folder into ./lib/commands/ with respect the  



# Licence

Free for all
