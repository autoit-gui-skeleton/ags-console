(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){


let agsConsole = require('./lib/AgsConsole')();
agsConsole.start();

},{"./lib/AgsConsole":2}],2:[function(require,module,exports){
/*
 * Copyright (c) 2018, AGS
 * 20100 <vb20100bv@gmail.com>
 */

'use strict';

const caporal = require('caporal');
const wrap = require('word-wrap');
const boxen = require('boxen');
const colors = require('colors');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const prettyjson = require('prettyjson');

/**
 * Expose
 *
 * @public
 * @type {AgsConsole}
 */
module.exports = AgsConsole;


/**
 * AgsConsole constructor
 *
 * @constructor
 * @param {object} options
 * @this {AgsConsole}
 */
function AgsConsole(options) {
    if (!(this instanceof AgsConsole)) {
        return new AgsConsole(options);
    }

    // Properties
    this.pkg = require('../package.json');
    this.caporal = caporal;
    this.defaultWrapOptions = {indent: '', width: _getWidthConsole() - 20};
    this.programName = "AGS Console";
    this.programBin = "ags";
}


/**
 * Start AGS console application
 */
AgsConsole.prototype.start = function () {
    // Extends and overides method in order to change default style and behaviour of caporal console application.
    this.extendCaporal();

    // Configure AGS console and adding commands
    this.configureCaporal();

    // Start AGS console
    this.caporal.parse(process.argv);
};


/**
 * Configure AGS console application
 */
AgsConsole.prototype.configureCaporal = function () {
    this.caporal
        .version(this.pkg.version)
        .description(this.pkg.description)


        .command('new', 'Create a new AGS project.')
        .help(wrap('To create a new AGS project, you must give it a name with this command. Indeed this name is used to create the project directory, where all AGS files are generated. The new directory is created by default into the current folder where the command is launch or into the directory specify in option <output>.', this.defaultWrapOptions))
        .argument('<name>', 'The name of new AGS project to create.')
        .option('-o, --output <output>', 'Create the project into the <output> folder.')
        .option('-t, --template <template>', 'Specify a <template> project to use. It must exist into ./templates/ directory.')
        .action(require('./commands/NewProjectCommand/NewProjectCommand'))


        .command('clean-code', 'Clean up all Autoit code with Tidy.')
        .help(wrap('To clean the code of a AGS project, you must launch this command into the root folder of the AGS project. Or you can launch this command anywhere, and specify with <directory> options where is the folder AGS project to clean. The cleaning is done with a recursive course in all the directories and sub-directories of the project, and excluding all files in \'./vendor/\' directory.', this.defaultWrapOptions))
        .argument(
            '[rootFolder]',
            'The root folder of an AutoIt project. It must have a valid AGS `package.json`. The default value used is the current directory (./) where the command is performed.',
            function (rootFolder) {
                if (!fs.existsSync(rootFolder)) {
                    throw new Error('This given root folder doesn\'t exist \'' + rootFolder + '\'');
                }
                return rootFolder;
            })
        .action(require('./commands/CleanCodeCommand/CleanCodeCommand'))


        .command('generate-setup', 'Generate a Windows installer of an AGS project.')
        .help(wrap('To generate a Windows installer of an AGS project. You can launch this command without argument in the root folder of an AGS project, or you can give the root folder in first argument. The root folder must have an `package.json` that respect AGS application conventions. This json file must have an AGS.application property, and it should look like this:', this.defaultWrapOptions) + '\n\n' + prettyjson.render({
            "AGS": {
                "framework": {"version": "1.0.0"},
                "AutoIt": {"version": "3.3.14.5"},
                "application": {
                    "main": "MyApp.au3",
                    "corporate": "A.C.M.E.",
                    "contact": "contact@acme.com"
                }
            }
        }))
        .argument(
            '[rootFolder]',
            'The root folder of an AGS project. It must have a valid AGS `package.json`. The default value used is the current directory (./) where the command is performed.',
            function (rootFolder) {
                if (!fs.existsSync(rootFolder)) {
                    throw new Error('This given root folder doesn\'t exist \'' + rootFolder + '\'');
                }
                return rootFolder;
            })
        // TODO: implements this option : .option('-o, --output <output>', 'Specify the <output> folder where the setup is generated.')
        .action(require('./commands/GenerateSetupCommand/GenerateSetupCommand'))
};


/**
 * Execute all extend caporal methods.
 *
 * @return void
 */
AgsConsole.prototype.extendCaporal = function () {
    this.extendCaporalLoggerError();
    this.extendCaporalFatalError();
    this.extendCaporalLoggerWarn();
    this.extendCaporalLoggerTitle();
    this.extendCaporalLoggerSubtitle();
    this.extendCaporalSplashscreen();
    this.extendCaporalVerbosity();
};


/**
 * Set verboisty by parsing given arguments command.
 */
AgsConsole.prototype.extendCaporalVerbosity = function () {
    let that = this;
    let argv = process.argv;
    this.caporal._logger.level = 'info';
    this.caporal._logger.levelVerbosity = 2;
    if (argv.includes('-v') || argv.includes('--verbose')) {
        this.caporal._logger.level = 'verbose';
        this.caporal._logger.levelVerbosity = 3;
    } else if (argv.includes('-vv')) {
        this.caporal._logger.level = 'debug';
        this.caporal._logger.levelVerbosity = 4;
    } else if (argv.includes('-vvv')) {
        this.caporal._logger.level = 'silly';
        this.caporal._logger.levelVerbosity = 5;
    }
    this.caporal._logger.isVerbose = function () {
        return that.caporal._logger.levelVerbosity > 2;
    };
    this.caporal._logger.isDebug = function () {
        return that.caporal._logger.levelVerbosity > 3;
    };
    this.caporal._logger.isSilly = function () {
        return that.caporal._logger.levelVerbosity > 4;
    };
};


/**
 * Extend logger's caporal. Overrides the logger for warning message.
 *
 * @return void
 */
AgsConsole.prototype.extendCaporalLoggerWarn = function () {
    this.caporal._logger.warn = function (msg) {
        console.log(
            colors.red(
                wrap(msg, {
                    indent: '',
                    width: _getWidthConsole() - 10
                })
            )
        );
    }
};


/**
 * Extend logger's caporal. Overrides the logger for error message.
 *
 * @return void
 */
AgsConsole.prototype.extendCaporalLoggerError = function () {
    this.caporal._logger.error = function (msg) {
        console.log(boxen(
            wrap(msg, {
                indent: '',
                width: _getWidthConsole() - 10
            }),
            {
                padding: {
                    top: 1,
                    bottom: 1,
                    left: 2,
                    right: 2
                },
                margin: {
                    top: 1,
                    bottom: 1,
                    left: 0,
                    right: 0
                },
                align: 'left',
                borderColor: 'red',
                borderStyle: 'single',
                backgroundColor: 'red',
            }));
    }
};


/**
 * Extend logger's caporal. Overrides the logger for fatal error message.
 *
 * @return void
 */
AgsConsole.prototype.extendCaporalFatalError = function () {
    let that = this;
    this.caporal.fatalError = function (errObj) {
        const stripAnsi = require('strip-ansi');
        let cleanMsg = stripAnsi(errObj.message.trim());
        cleanMsg = cleanMsg.replace(/(Type )(.*)( for help.)/gm, '\$1' + colors.bold(that.programBin + ' --help') + '\$3');
        cleanMsg += '\nType ' + colors.bold(that.programBin + ' <command> --help') + ', to display help for a specific command';
        that.caporal.logger().error(cleanMsg);
        process.exit(2);
    }
};


/**
 * Extend logger's caporal with a method to generate a title in console output.
 *
 * @return void
 */
AgsConsole.prototype.extendCaporalLoggerTitle = function () {
    this.caporal._logger.title = function (msg) {
        console.log(boxen(msg, {
            padding: {
                top: 1,
                bottom: 1,
                left: 2,
                right: 2
            },
            margin: {
                top: 1,
                bottom: 1,
                left: 0,
                right: 0
            },
            align: 'left',
            borderColor: 'blue',
            borderStyle: 'double',
            backgroundColor: 'blue'
        }));
    }
};


/**
 * Extend logger's caporal with a method to generate a subtitle in console output.
 *
 * @return void
 */
AgsConsole.prototype.extendCaporalLoggerSubtitle = function () {
    this.caporal._logger.subtitle = function (msg) {
        msg = '  ' + msg + '  ';
        let leftMsg = colors.blue('│') + colors.bgBlue(msg) + colors.blue('├');
        let rightMsg = '';
        for (let i = 0; i < _getWidthConsole() - msg.length - 4; i++) {
            rightMsg += colors.blue('─');
        }
        let subtitle = leftMsg + rightMsg + colors.blue('■');
        console.log(subtitle);
    }
};


/**
 * Create a splashscreen for AGS console application
 *
 * @param {string} program_name
 * @param {string} program_version
 * @param {string} program_description
 * @return {string}
 **/
AgsConsole.prototype.splashscreen = function (program_name, program_version, program_description) {

    let splashscreen = '';
    let ascii =
        '      db        .g8"""bgd   .M"""bgd' + '\n' +
        '     ;MM:     .dP\'     `M  ,MI    "Y' + '\n' +
        '    ,V^MM.    dM\'       `  `MMb.    ' + '\n' +
        '   ,M  `MM    MM             `YMMNq.' + '\n' +
        '   AbmmmqMA   MM.    `7MMF\'.     `MM' + '\n' +
        '  A\'     VML  `Mb.     MM  Mb     dM' + '\n' +
        '.AMA.   .AMMA.  `"bmmmdPY  P"Ybmmd"  ' + '\n';

    let msg =
        'Copyright © 2018,\n' +
        program_name + ' v' + program_version + '\n\n' +
        program_description + '\n' +
        colors.bold('https://autoit-gui-skeleton.github.io');

    return boxen(
        ascii + '\n' + wrap(msg, {
            indent: '',
            width: _getWidthConsole() - 10
        }), {
            padding: {
                top: 1,
                bottom: 1,
                left: 2,
                right: 2
            },
            margin: {
                top: 1,
                bottom: 2,
                left: 2,
                right: 0
            },
            align: 'center',
            borderColor: 'blue',
            borderStyle: 'double',
            backgroundColor: 'blue'
        });
};


/**
 * Extend caporal with a method to generate a splashscreen in output console.
 *
 * In order to do it, we need to overides few method by extends the Help class use in caporal.
 *
 * @return void
 */
AgsConsole.prototype.extendCaporalSplashscreen = function () {
    const Help = require('../node_modules/caporal/lib/help');

    let that = this;

    class newHelp extends Help {
        get(command) {
            if (!command && this._program._commands.length === 1) {
                command = this._program._commands[0];
            }
            let program_description = this._program.description() ? this._program.description() : '';

            let help = that.splashscreen(that.programName, this._program.version(), program_description);
            help = help + `   ${this._getUsage(command)}`;

            if (!command || command.name() === '' && this._program._commands.length > 1) {
                help += "\n\n   " + this._getCommands();
            }
            help += this._renderHelp('_program');
            help += "\n\n   " + this._getGlobalOptions();
            return help + "\n";
        }

        _getUsage(cmd) {
            let help = chalk.bold('USAGE') + '\n\n     ' + chalk.italic(that.programBin) + ' ';
            if (cmd) {
                help += _colorize(this._getCommandHelp(cmd));
            } else {
                help += _colorize('<command> [options]');
            }
            return help;
        }
    }

    this.caporal._helper = new newHelp(this.caporal);
};


/**
 * Get the width of current console.
 *
 * @returns {number}
 * @private
 */
let _getWidthConsole = () => {
    let widthConsole = 80;
    if (process.stdout.isTTY) {
        let size = process.stdout.getWindowSize();
        widthConsole = size[0];
    }
    return widthConsole
};


/**
 * Add automatically colors by parsing regexp pattern.
 *
 * @param text {string}
 * @returns {string}
 * @private
 */
let _colorize = (text) => {
    return text.replace(/<([a-z0-9-_.]+)>/gi, (match) => {
        return chalk.blue(match);
    }).replace(/<command>/gi, (match) => {
        return chalk.magenta(match);
    }).replace(/\[([a-z0-9-_.]+)\]/gi, (match) => {
        return chalk.yellow(match);
    }).replace(/ --?([a-z0-9-_.]+)/gi, (match) => {
        return chalk.green(match);
    });
};
},{"../node_modules/caporal/lib/help":10,"../package.json":11,"./commands/CleanCodeCommand/CleanCodeCommand":3,"./commands/GenerateSetupCommand/GenerateSetupCommand":4,"./commands/NewProjectCommand/NewProjectCommand":6,"boxen":undefined,"caporal":undefined,"chalk":undefined,"colors":undefined,"fs":undefined,"path":undefined,"prettyjson":undefined,"strip-ansi":undefined,"word-wrap":undefined}],3:[function(require,module,exports){
(function (__dirname){
/*
 * Copyright (c) 2018, AGS
 * 20100 <vb20100bv@gmail.com>
 */

'use strict';

const path = require('path');
const fastGlob = require('fast-glob');
const colors = require('colors');
const shell = require('shelljs');
const fs = require('fs');
const asyncjs = require('async');


/**
 * Set action for CreateNewAgsProjectCommand
 *
 * @public
 * @param args, all caporal's command arguments
 * @param options, all caporal's command options
 * @param logger, winston logger configure into caporal
 */
module.exports = (args, options, logger) => {

    /**
     * The directory where to parse and clean AutoIt code with the binary Tidy
     *
     * @type {string}
     */
    let directory;
    if (typeof args.rootFolder !== 'undefined' && args.rootFolder !== null) {
        directory = path.resolve(args.rootFolder);
    } else {
        directory = path.resolve(process.cwd() + '/.');
    }
    let directoryBasename = path.basename(path.dirname(directory));


    /**
     * Self invoking function use in order to run this command.
     *
     * @returns {Promise<void>}
     * @private
     */
    (async function _runCommand() {
        logger.title('Clean all AutoIt code source');

        try {
            /**
             * The directory where binary Tidy.exe is store.
             *
             * @type {string}
             */
            const pathTidy = path.resolve(__dirname, '../../../bin/SciTE4AutoIt3/Tidy/Tidy.exe');
            const binDirectory = path.dirname(pathTidy);
            const userProfile = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
            const backupDirectory = userProfile + '\\AppData\\Local\\AGS\\TidyBackup\\';
            logger.debug('[INFO] Path Tidy:', pathTidy);
            logger.debug('[INFO] Bin directory:', binDirectory);
            logger.debug('[INFO] Directory to parsed:', directory);
            logger.debug('[INFO] Basename to parsed:', directoryBasename);
            logger.debug('[INFO] userProfile:', userProfile);
            logger.debug('[INFO] backupDirectory:', backupDirectory);

            if (!fs.existsSync(pathTidy)) {
                throw new Error('Error: This file '
                    + colors.bold(pathTidy)
                    + ' doesn\'t available or exist.');
            }

            const autoitFiles = await _findAutoItFiles(pathTidy);
            await _tidyFiles(autoitFiles, pathTidy, backupDirectory);

            console.log('\n--- end ---\n');
        } catch (error) {
            if (typeof error.message !== 'undefined' && error.message !== null) {
                logger.error(error.message);
            } else {
                logger.error(error);
            }
        }
    })();


    /**
     * Search AutoIt files into allowed directories
     *
     * @returns {Promise<*>}
     * @private
     */
    async function _findAutoItFiles(pathTidy) {
        return new Promise(async (resolve) => {
            console.log('');
            logger.subtitle('1. Find AutoIt files');

            let glob = [
                directory + '/**/*.au3',
                '!' + directory + '/**/vendor/**'
            ];
            logger.debug('[INFO] Search AutoIt files with this glob:\n', colors.green(glob));
            logger.debug('[INFO] Path to binary Tidy to use:', colors.green(pathTidy));
            const files = fastGlob.sync(glob);
            if (files.length === 0) {
                logger.warn('[KO] Warning !!! the directory ' + directory + ' doesn\'t have any AutoIt files (*.au3).');
                process.exit(0);
            }
            logger.debug('[INFO] Listing of ' + files.length + ' Autoit files founded:', files);
            console.log('[OK] The directory ' + colors.green(directory) + ' contains '
                + files.length + ' AutoIt files in allowed directories.');
            resolve(files);
        });
    }


    /**
     * Execute Tidy binary on each AutoIt Files founded
     *
     * @param autoitFiles
     * @param pathTidy
     * @returns {Promise<any>}
     * @private
     */
    async function _tidyFiles(autoitFiles, pathTidy, backupDirectory) {
        return new Promise(async (resolve, reject) => {
            console.log('');
            logger.subtitle('2. Clean AutoIt files with Tidy');


            asyncjs.eachSeries(autoitFiles, (autoitFile, callback) => {

                // const backupDirectory = userProfile + '\\AppData\\Local\\AGS\\TidyBackup\\' + directoryBasename + '\\';
                //d:/AGS/ags-project-examples/ags-project-001___application-minimal/src/views/View_Welcome.au3//
                let regExp = new RegExp(directoryBasename + '(.*)', "g");
                let result = autoitFile.match(regExp);
                if (result !== null) {
                    let itemBackupDirectory = path.normalize(backupDirectory + path.dirname(result[0]));
                    let mkdirResult = shell.mkdir('-p', itemBackupDirectory);
                    if(shell.error()) {
                        callback(new Error('Error: Unable to create the backup directory ' + colors.bold(backupDirectory)
                            + ' use with Tidy.', mkdirResult));
                    } else {
                        logger.debug('[OK] The backup firectory for this item have just been created :', itemBackupDirectory);
                    }

                    logger.debug('[INFO] Backup directory used for this item:', itemBackupDirectory);
                    logger.debug('[INFO] Processing Tidy on file: ', colors.green(autoitFile));
                    let cmdTmp = '"' + pathTidy + '" '
                        + ' "' + autoitFile + '"'
                        + ' /keepnversions=0'
                        + ' /noshowdiffpgm'
                        + ' /Remove_EndFun_comment'
                        + ' /Remove_Endregion_Comment'
                        + ' /backupdir=' + itemBackupDirectory + '\\';
                    if (logger.isVerbose()) {
                        cmdTmp += ' /ShowConsoleInfo=9';
                    } else {
                        cmdTmp = '(' + cmdTmp + ') >nul 2>&1';
                    }

                    logger.debug('[INFO] command: ', colors.green(cmdTmp));
                    shell.exec(cmdTmp, (code, stdout, stderr) => {
                        //logger.debug('[INFO] Exit code: ', code);
                        //logger.debug('[INFO] stdout: ', stdout);
                        //logger.debug('[INFO] stderr: ', stderr);
                        logger.debug('-----------------------\n');
                        callback();
                    });

                } else {
                    callback(new Error('[KO] The regexp pattern does not match ' + regExp + ' on file ' + autoitFile));
                }
            }, error => {
                if (error) {
                    reject(error);
                } else {
                    console.log('[OK] All AutoIt files have been cleaned with Tidy.');
                    resolve(true);
                }
            });
        });
    }

};
}).call(this,"/lib/commands/CleanCodeCommand")
},{"async":undefined,"colors":undefined,"fast-glob":undefined,"fs":undefined,"path":undefined,"shelljs":undefined}],4:[function(require,module,exports){
(function (__dirname){
/*
 * Copyright (c) 2018, AGS
 * 20100 <vb20100bv@gmail.com>
 */

const path = require('path');
const colors = require('colors');
const fs = require('fs');


/**
 * Set action for GenerateSetupCommand
 *
 * @public
 * @param args, all caporal's command arguments
 * @param options, all caporal's command options
 * @param logger, winston logger configure into caporal
 */
module.exports = (args, options, logger) => {

    /**
     * Self invoking function use in order to run this command.
     *
     * @returns {Promise<void>}
     * @private
     */
    (async function _runCommand() {
        logger.title('Generate Windows installer');

        try {
            let parameters = await _checkParameters();
            await _executeWindowsBatchAGSPackager(parameters);

            console.log('\n--- end ---\n');
        } catch (error) {
            if (typeof error.message !== 'undefined' && error.message !== null) {
                logger.error(error.message);
            } else {
                logger.error(error);
            }
        }
    })();


    /**
     * Check and set parameters use into this action command
     *
     * @returns {Promise<any>}
     * @private
     */
    async function _checkParameters() {
        return new Promise(async (resolve, reject) => {
            logger.subtitle('1. Check process variables');

            // Check rootFolder
            let {rootFolder} = args;
            if (rootFolder === undefined || rootFolder === null) {
                rootFolder = '.';
            }
            rootFolder = path.resolve(process.cwd(), rootFolder);
            logger.debug('[INFO] rootFolder:', rootFolder);

            // Check if rootFolder is a directory
            if (!fs.statSync(rootFolder).isDirectory()) {
                return reject(new Error('Error: You must give a directory and not a file for the root folder '
                    + colors.bold(rootFolder)
                    + '.'
                    + '\n\nType ' + colors.bold('ags generate-setup --help') + ' to display help for this command.'));
            }

            // Check packageJsonPath
            let packageJsonPath = path.resolve(process.cwd(), rootFolder, 'package.json');
            logger.debug('[INFO] packageJsonPath:', packageJsonPath);
            if (!fs.existsSync(packageJsonPath)) {
                return reject(new Error('Error: This given root folder '
                    + colors.bold(rootFolder)
                    + ' doesn\'t have a package.json'
                    + '\n\nType ' + colors.bold('ags generate-setup --help') + ' to display help for this command.'));
            }

            // Check if package.json is an AGS project application
            let packageJsonParsed = require(packageJsonPath);
            logger.debug('[INFO] packageJson:', packageJsonParsed);
            if (typeof packageJsonParsed.AGS === 'undefined' || packageJsonParsed.AGS === null) {
                return reject(new Error('Error: The package.json ' + colors.bold(packageJsonPath) + ' stored in the given root folder and use to perform Windows installer generation, does not match to an AGS project. Because it doesn\'t have the json property \'AGS\' into it. You must add it and fill this property correctly into your pakcage.json of your AGS project.' +
                    '\n\nType ' + colors.bold('ags generate-setup --help') + ' to display help for this command.'));
            }
            if (typeof packageJsonParsed.AGS.application === 'undefined' || packageJsonParsed.AGS.application === null) {
                return reject(new Error('Error: The package.json ' + colors.bold(packageJsonPath) + ' stored in the given root folder and use to perform Windows installer generation, does not match to an AGS project application. Because it doesn\'t have the json property \'AGS.application\' into it. You must add it and fill this property correctly into pakcage.json of your AGS project.' +
                '\n\nType ' + colors.bold('ags generate-setup --help') + ' to display help for this command.'));
            }

            logger.debug('[OK] all parameters have been checked with sucess.');
            resolve({
                rootFolder: rootFolder,
                packageJsonPath: packageJsonPath,
                packageJsonParsed: packageJsonParsed
            });
        });
    }


    /**
     * Execute the Windows batch ags-packager.bat with parameters parsed into package.json
     *
     * @param parameters.rootFolder
     * @param parameters.packageJsonPath
     * @param parameters.packageJsonParsed
     * @returns {Promise<any>}
     * @private
     */
    async function _executeWindowsBatchAGSPackager(parameters) {
        return new Promise(async (resolve, reject) => {
            console.log('');
            logger.subtitle('2. Execute Windows batch ags-packager');

            const spawn = require('child_process').spawn;
            const batchFile = path.resolve(__dirname, '../../../bin/ags-packager/ags-packager.bat');
            const binDirectory = path.dirname(batchFile);
            logger.debug('[INFO] Batch file:', batchFile);
            logger.debug('[INFO] Bin directory:', binDirectory);
            if (!fs.existsSync(batchFile)) {
                return reject(new Error('Error: This file  '
                    + colors.bold(batchFile)
                    + ' doesn\'t available or exist.'));
            }

            const jqBinary = path.resolve(__dirname, '../../../bin/ags-packager/jq-win64.exe');
            logger.debug('[INFO] JQ binary:', jqBinary);
            if (!fs.existsSync(jqBinary)) {
                return reject(new Error('Error: This file  '
                    + colors.bold(jqBinary)
                    + ' doesn\'t available or exist.'));
            }

            const batch = spawn(
                'cmd.exe',
                ['/c', batchFile, parameters.rootFolder, binDirectory],
                {stdio: [null, null, null]}
            );

            batch.stdout.on('data', (data) => {
                if (logger.levels[logger.level] > 2) {
                    process.stdout.write(colors.cyan(data.toString()));
                } else {
                    let str = data.toString();
                    let result = str.match(/(Step [1-9] - .*)/g);
                    if (result !== null) {
                        process.stdout.write(
                            '\n  ' +
                            colors.blue('│') +
                            colors.bgBlue('  ' + result[0].substring(0, result[0].length - 3) + '  ') +
                            colors.blue('│') +
                            '\n'
                        );
                    }
                }
            });

            batch.stderr.on('data', (data) => {
                process.stdout.write(colors.red('    [WARNING] ' + data.toString()));
            });

            batch.on('exit', (code) => {
                logger.debug('[INFO] Batch process `' + batchFile + '` child exited with code:', code);
                resolve(code);
            });
        });
    }


};

}).call(this,"/lib/commands/GenerateSetupCommand")
},{"child_process":undefined,"colors":undefined,"fs":undefined,"path":undefined}],5:[function(require,module,exports){
/*
 * Copyright (c) 2018, AGS
 * 20100 <vb20100bv@gmail.com>
 */

module.exports = {
    validateInputNotEmpty,
    validateInputEmail,
    validateSemanticVersioning
};

function validateInputNotEmpty(value) {
    if (value.length < 1) {
        return 'Please must be not empty.';
    }
    return true;
}

function validateInputEmail(value) {
    let check = value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])+/i);
    if (check) {
        return true;
    }
    return 'Please enter a valid email.';
}

function validateSemanticVersioning(value) {
    let check = value.match(/(?<=^[Vv]|^)(?:(?<major>(?:0|[1-9](?:(?:0|[1-9])+)*))[.](?<minor>(?:0|[1-9](?:(?:0|[1-9])+)*))[.](?<patch>(?:0|[1-9](?:(?:0|[1-9])+)*))(?:-(?<prerelease>(?:(?:(?:[A-Za-z]|-)(?:(?:(?:0|[1-9])|(?:[A-Za-z]|-))+)?|(?:(?:(?:0|[1-9])|(?:[A-Za-z]|-))+)(?:[A-Za-z]|-)(?:(?:(?:0|[1-9])|(?:[A-Za-z]|-))+)?)|(?:0|[1-9](?:(?:0|[1-9])+)*))(?:[.](?:(?:(?:[A-Za-z]|-)(?:(?:(?:0|[1-9])|(?:[A-Za-z]|-))+)?|(?:(?:(?:0|[1-9])|(?:[A-Za-z]|-))+)(?:[A-Za-z]|-)(?:(?:(?:0|[1-9])|(?:[A-Za-z]|-))+)?)|(?:0|[1-9](?:(?:0|[1-9])+)*)))*))?(?:[+](?<build>(?:(?:(?:[A-Za-z]|-)(?:(?:(?:0|[1-9])|(?:[A-Za-z]|-))+)?|(?:(?:(?:0|[1-9])|(?:[A-Za-z]|-))+)(?:[A-Za-z]|-)(?:(?:(?:0|[1-9])|(?:[A-Za-z]|-))+)?)|(?:(?:0|[1-9])+))(?:[.](?:(?:(?:[A-Za-z]|-)(?:(?:(?:0|[1-9])|(?:[A-Za-z]|-))+)?|(?:(?:(?:0|[1-9])|(?:[A-Za-z]|-))+)(?:[A-Za-z]|-)(?:(?:(?:0|[1-9])|(?:[A-Za-z]|-))+)?)|(?:(?:0|[1-9])+)))*))?)$/);
    if (check) {
        return true;
    }
    return 'Please enter a valid semantic versioning (https://semver.org/).';
}
},{}],6:[function(require,module,exports){
(function (__dirname){
/*
 * Copyright (c) 2018, AGS-console
 * 20100 <vb20100bv@gmail.com>
 */

'use strict';

const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const os = require('os');
const colors = require('colors');
const inquirer = require('inquirer');
const inquirerValidators = require('./InquirerValidators');


const templateEngine = require('./TemplateEngine');
/**
 * The template variables are asked to user with the method _inquirerConfigurationAGS.
 * Tye are used to replace the placeholder values, by iterate and read all template files.
 *
 * @type {string[]}
 */
const templateVariables = require('./TemplateVariables');


/**
 * Set action for CreateNewAgsProjectCommand
 *
 * @public
 * @param args, all caporal's command arguments
 * @param options, all caporal's command options
 * @param logger, winston logger configure into caporal
 */
module.exports = (args, options, logger) => {

    const template = options.template || 'default';
    const templatePath = path.resolve(__dirname + "/../../../templates/" + template);
    const output = options.output || undefined;


    /**
     * Set value for template variables which no need asked to user
     *
     * @param answersConfiguration, given by inquirer.prompt
     * @private
     */
    function _initializeDefaultTemplateVariables(answersConfiguration) {
        answersConfiguration.year = new Date().getFullYear();
        answersConfiguration.AGSVersion = require('../../../package.json').AGS.framework.version;
        answersConfiguration.AutoItVersion = require('../../../package.json').AGS.AutoIt.version;
        return answersConfiguration;
    }


    /**
     * Self invoking function use in order to run this command.
     *
     * @returns {Promise<void>}
     * @private
     */
    (async function _runCommand() {
        logger.title('Create a new AGS project');

        try {
            const configurationAGS = await _inquirerConfigurationAGS();
            await _createOutputDirectory(configurationAGS.outputPath);
            await _copyTemplateFiles(configurationAGS.outputPath);
            await templateEngine.renamingFileVariables(configurationAGS, logger);
            await templateEngine.replacingTemplateVariables(configurationAGS, logger);

            console.log('\n--- end ---\n');
        } catch (error) {
            if (typeof error.message !== 'undefined' && error.message !== null) {
                logger.error(error.message);
            } else {
                logger.error(error);
            }
        }
    })();


    /**
     * Check if the template choosen exist.
     *
     * @returns {Promise<*>}
     * @private
     */
    function _checkTemplatePathOptions() {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(templatePath)) {
                logger.debug('[OK] The template ' + colors.blue('<' + template + '>') + ' was found into \'./templates/\' folder');
                resolve(true);
            } else {
                reject(new Error('[KO] The template ' + colors.bold('<' + template + '>') + ' wasn\'t found into \'./templates/\' folder'));
            }
        });
    }


    /**
     * Inquirer for configuration of a new AGS project with promises.
     *
     * @returns {Promise<void>}
     * @private
     */
    async function _inquirerConfigurationAGS() {
        logger.subtitle('1. Configuration of new AGS project');

        await _checkTemplatePathOptions();

        function _askConfigurationAGS() {
            return new Promise((resolve) => {
                inquirer.prompt([{
                    type: 'input',
                    name: 'projectAGSName',
                    message: 'What is the name of your AGS project?',
                    default: args.name,
                    validate: inquirerValidators.validateInputNotEmpty
                }, {
                    type: 'input',
                    name: 'projectAGSVersion',
                    message: 'What is the version of your AGS project - use semantic versioning?',
                    default: '1.0.0',
                    validate: inquirerValidators.validateSemanticVersioning
                }, {
                    type: 'input',
                    name: 'projectAGSDescription',
                    message: 'Short description of your project:',
                    default: 'I believe i can fly...'
                }, {
                    type: 'input',
                    name: 'authorName',
                    message: 'Name project\'s author:',
                    default: os.userInfo().username,
                    validate: inquirerValidators.validateInputNotEmpty
                }, {
                    type: 'input',
                    name: 'authorEmail',
                    message: 'Email project\'s author:',
                    default: os.userInfo().username + '@no-reply.com',
                    validate: inquirerValidators.validateInputEmail
                }, {
                    type: 'list',
                    name: 'license',
                    message: 'What license do you use for this project?',
                    choices: ['MIT License', 'Apache License 2.0', 'GNU General Public License v3.0', 'GNU Lesser General Public License v3.0', 'Unlicense', 'My custom license'],
                }, {
                    type: 'confirm',
                    name: 'confirmConfiguration',
                    message: 'Do you confirm this configuration?',
                    default: true,
                    when: function (answers) {
                        console.log(answers);
                        return true;
                    }
                }]).then(async answersConfiguration => {
                    if (!answersConfiguration.confirmConfiguration) {
                        console.log('');
                        console.log(' --- change this configuration --- ');
                        resolve(_askConfigurationAGS());
                    } else {

                        // The output directory where the new AGS project is generate.
                        let outputPath = '';
                        if (output === undefined) {
                            outputPath = path.resolve(process.cwd() + "/" + answersConfiguration.projectAGSName);
                        } else {
                            outputPath = path.resolve(process.cwd() + "/" + output + "/" + answersConfiguration.projectAGSName);
                        }
                        answersConfiguration.outputPath = outputPath;
                        answersConfiguration.templatePath = templatePath;
                        answersConfiguration = _initializeDefaultTemplateVariables(answersConfiguration);

                        logger.debug('[INFO] Output directory: ', outputPath);
                        logger.debug('[INFO] Template directory: ', templatePath);
                        logger.debug('[INFO] AGS configuration: ', answersConfiguration);

                        console.log('[OK] It has a valid configuration.');
                        resolve(answersConfiguration);
                    }
                });
            });
        }

        return await _askConfigurationAGS();
    }


    /**
     * Create output directory
     *
     * @param outputPath {string}
     * @returns {Promise<any>}
     * @private
     */
    async function _createOutputDirectory(outputPath) {
        return new Promise((resolve, reject) => {
            console.log('');
            logger.subtitle('2. Create output directory');
            logger.debug('[INFO] Try create the output directory:', outputPath);

            let result = {};
            result.outputDirectory = {};
            result.outputDirectory.path = outputPath;
            if (!fs.existsSync(outputPath)) {
                result.outputDirectory.alreadyExists = false;
                fs.mkdirSync(outputPath);

                console.log('[OK] Output directory was created!');
                resolve(result);
            } else {
                result.outputDirectory.alreadyExists = true;
                logger.warn('[KO] Warning !!! the directory ' + outputPath
                    + ' already exist and you choose to keep its files. You can only create a new AGS project in an empty directory.');

                inquirer.prompt([{
                    type: 'confirm',
                    name: 'confirmDeleteFiles',
                    message: 'Do you want to clean this folder (' + outputPath + ') by delete all files in order to continue?',
                    default: false
                }]).then(async answers => {
                    if (answers.confirmDeleteFiles) {
                        shell.rm('-rf', outputPath);
                        logger.debug('[OK] All files in this folder (' + outputPath + ') have just been deleted.');
                        fs.mkdirSync(outputPath);
                        logger.debug('[OK] Output directory is created!', outputPath);

                        console.log('[OK] Output directory is cleaned!');
                        resolve(result);
                    } else {
                        // With async declaration this throw instruction is the same as "return Promise.reject(new Error(...))";
                        reject(new Error('[KO] Warning !!! the directory ' + outputPath
                            + ' already exist, and you choose to not delete this files.'));
                    }
                });
            }
        });
    }


    /**
     * Copy all files and folder from the template folder choose to the output directory.
     *
     * @param outputPath {string}
     * @returns {Promise<*>}
     * @private
     */
    async function _copyTemplateFiles(outputPath) {
        return new Promise((resolve, reject) => {
            let result = {};
            console.log('');
            logger.subtitle('3. Copy template files');
            logger.debug('[INFO] Try copying files from templatePath ' + templatePath + ' into ' + outputPath);
            if (fs.existsSync(templatePath)) {
                logger.debug("[OK] The template '" + template + "' was found into './templates/' folder");
                shell.cp('-R', `${templatePath}/*`, outputPath);
                result.templateFilesCopied = true;

                console.log('[OK] All templates files have been copied in output directory.', outputPath);
                resolve(result);
            } else {
                result.templateFilesCopied = false;
                reject(new Error('[KO] Unable to copy this files because the template "' + template
                    + '" wasn\'t found into "./templates/" folder.'));
            }
        });
    }

};
}).call(this,"/lib/commands/NewProjectCommand")
},{"../../../package.json":11,"./InquirerValidators":5,"./TemplateEngine":7,"./TemplateVariables":8,"colors":undefined,"fs":undefined,"inquirer":undefined,"os":undefined,"path":undefined,"shelljs":undefined}],7:[function(require,module,exports){
/*
 * Copyright (c) 2018, AGS-console
 * 20100 <vb20100bv@gmail.com>
 */

'use strict';


const fs = require('fs');
const fastGlob = require('fast-glob');
const templateVariables = require('./TemplateVariables');
const colors = require('colors');
const nunjucks = require('nunjucks');
const asyncjs = require('async');
const inquirer = require("inquirer");
const slug = require('slug');


/**
 * @public
 * @type {{renamingFileVariables: renamingFileVariables}}
 */
module.exports = {
    renamingFileVariables,
    replacingTemplateVariables
};


/**
 * Parse templateVariables in order to build all regexp and associated value used to replacing template variables.
 *
 * @param configurationAGS
 * @returns {{regexPatterns: Array, regexValuesForPatterns: Array}}
 * @private
 */
function _regexsTemplatesVariable(configurationAGS) {
    let regexPatterns = [];
    let regexValuesForPatterns = [];
    for (let variable of templateVariables) {
        regexPatterns.push(new RegExp('{%' + variable + '%}', 'g'));
        regexValuesForPatterns.push(configurationAGS[variable]);
    }
    return {regexPatterns: regexPatterns, regexValuesForPatterns: regexValuesForPatterns};
}


/**
 * Renaming all files in output directory which contains template variables in a part of its name.
 *
 * @param configurationAGS
 * @param logger
 * @returns {Promise<any>}
 */
async function renamingFileVariables(configurationAGS, logger) {
    let outputPath = configurationAGS.outputPath;

    return new Promise(async (resolve) => {
        console.log('');
        logger.subtitle('4. Renaming files');

        const files = fastGlob.sync([
            outputPath + '/*',
            outputPath + '/bin/**',
            outputPath + '/config/**',
            outputPath + '/deployment/**',
            outputPath + '/src/**',
            '!' + outputPath + '/vendor/**'
        ]);

        let regexsTemplatesVariable = _regexsTemplatesVariable(configurationAGS);
        files.forEach(async file => {
            for (let i = 0; i < regexsTemplatesVariable.regexPatterns.length; i++) {
                let regex = regexsTemplatesVariable.regexPatterns[i];
                let value = regexsTemplatesVariable.regexValuesForPatterns[i];
                let check = file.match(regex);
                if (check) {
                    let newName = file.replace(regex, value);
                    logger.debug('[INFO] Founded file with template variable. '
                        + colors.green(file) + ' rename to '
                        + colors.cyan(newName));
                    fs.renameSync(file, newName);
                }
            }
        });
        console.log('[OK] All files with template variable have been renamed.');
        resolve(true);
    });
}


/**
 * Replacing all template variable into all files copied in output directory.
 *
 * @param configurationAGS
 * @param logger
 * @returns {Promise<*>}
 * @private
 */
async function replacingTemplateVariables(configurationAGS, logger) {
    let outputPath = configurationAGS.outputPath;
    _NunjucksCustomFilter();

    return new Promise(async (resolve, reject) => {
        console.log('');
        logger.subtitle('5. Replacing template variables');


        /**
         * Check if all template variables have a value.
         *
         * @param configurationAGS
         * @returns {Promise<any>}
         * @private
         */
        async function _checkTemplateVariables(configurationAGS) {
            return new Promise((resolve) => {
                let checkTemplateVariables = true;
                for (let variable of templateVariables) {
                    logger.debug('[INFO] Template variable '
                        + colors.green(variable) + ' is equals to '
                        + colors.cyan(configurationAGS[variable]));
                    if (configurationAGS[variable] === undefined || configurationAGS[variable] == null) {
                        logger.warn('[KO] The template variable ' + colors.bold(variable) + ' doesn\'t have value into the configuration.');
                        checkTemplateVariables = false;
                    }
                }

                if (!checkTemplateVariables) {
                    inquirer.prompt([{
                        type: 'confirm',
                        name: 'confirmReplacingFiles',
                        message: 'It was found template variables with no values. Do you still want to replace them or kill process?',
                        default: true
                    }]).then(async answers => {
                        resolve(answers.confirmReplacingFiles);
                    });
                } else {
                    resolve(true);
                }
            });
        }

        if (!await _checkTemplateVariables(configurationAGS)) {
            reject(new Error('[KO] Because it was found template variables with no values, and you choose to kill the process. ' +
                'Warning, the directories and files have already been created.'));
        } else {

            const files = fastGlob.sync([
                outputPath + '/**',
                '!' + outputPath + '/bin/**',
                '!' + outputPath + '/vendor/**',
                '!' + outputPath + '/**/*.jpg',
                '!' + outputPath + '/**/*.bmp',
                '!' + outputPath + '/**/*.png',
                '!' + outputPath + '/**/*.gif',
                '!' + outputPath + '/**/*.iss'
            ]);
            logger.debug('[INFO] Files to parse:', files);

            let changes = [];
            asyncjs.eachSeries(files, (file, callback) => {
                try {
                    logger.debug('[INFO] Party rock on file:', file);
                    let result = _replace(file, configurationAGS);
                    if (result) {
                        changes.push(file);
                    }
                    callback();
                } catch (error) {
                    callback(error);
                }
            }, error => {
                if (error) {
                    reject(error);
                } else {
                    logger.debug('[INFO] Replacing variables impact ' + changes.length + ' files: ', changes);

                    console.log('[OK] All templates variables have been replaced into ' + changes.length + ' files.');
                    resolve(true);
                }
            });
        }
    });
}


/**
 * Replace in a single file - resolve true if the file is changed and otherwise false
 *
 * @param file
 * @param configurationAGS
 * @returns {boolean}
 * @private
 */
function _replace(file, configurationAGS) {
    // Read contents with encoding default utf8
    const contents = fs.readFileSync(file, 'utf8');
    // Render template
    const contentsRendered = nunjucks.renderString(contents, configurationAGS);
    // Check if anything changes
    if (contentsRendered === contents) {
        return false;
    } else {
        // Write changements into file
        fs.writeFileSync(file, contentsRendered);
        return true;
    }
}


/**
 * Add custom filters for Nunjucks template engine
 *
 * @private
 */
function _NunjucksCustomFilter() {
    let env = nunjucks.configure('views');
    env.addFilter('slug', function (str) {
        return slug(str, '.');
    });
}
},{"./TemplateVariables":8,"async":undefined,"colors":undefined,"fast-glob":undefined,"fs":undefined,"inquirer":undefined,"nunjucks":undefined,"slug":undefined}],8:[function(require,module,exports){
/*
 * Copyright (c) 2018, AGS
 * 20100 <vb20100bv@gmail.com>
 */

let templateVariables = [
    // Template variables which need asked to user
    'projectAGSName',
    'projectAGSVersion',
    'projectAGSDescription',
    'authorName',
    'authorEmail',
    'license',

    // Template variables which NO need asked to user
    'year',
    'AGSVersion',
    'AutoItVersion'
];

module.exports = templateVariables;



},{}],9:[function(require,module,exports){
"use strict";

const chalk = require('chalk');

exports.colorize = (text) => {
  return text.replace(/<([a-z0-9-_.]+)>/gi, (match) => {
    return chalk.blue(match);
  }).replace(/<command>/gi, (match) => {
    return chalk.magenta(match);
  }).replace(/\[([a-z0-9-_.]+)\]/gi, (match) => {
    return chalk.yellow(match);
  }).replace(/ --?([a-z0-9-_.]+)/gi, (match) => {
    return chalk.green(match);
  });
};

},{"chalk":undefined}],10:[function(require,module,exports){
"use strict";

const merge = require('lodash.merge');
const Table = require('cli-table2');
const chalk = require('chalk');
const colorize = require('./colorful').colorize;

/**
 * @private
 */
class Help {

  constructor(program) {
    this._program = program;
    this._customHelp = {};
  }

  /**
   * Add a custom help for the whole program or a specific command
   *
   * @param {String} help - Help text
   * @param {Object} options - Help options
   * @param {Command|null} command - Command concerned or null for program help
   * @private
   */
  _addCustomHelp(help, options, command) {
    options = merge ({
      indent: true,
      name: command ? '' : 'MORE INFO'
    }, options);
    const key = command ? command._name : '_program';
    if ( !this._customHelp[key] ) this._customHelp[key] = [];
    this._customHelp[key].push([help, options]);
  }

  get(command) {

    if (!command && this._program._commands.length === 1) {
      command = this._program._commands[0];
    }

    const description = this._program.description() ? '- ' + this._program.description() : '';
    let help = `
   ${chalk.cyan(this._program.name() || this._program.bin())} ${chalk.dim(this._program.version())} ${description}

   ${this._getUsage(command)}`;

    if (!command || command.name() === '' && this._program._commands.length > 1) {
      help += "\n\n   " + this._getCommands();
    }

    help += this._renderHelp('_program');

    help += "\n\n   " + this._getGlobalOptions();

    return help + "\n";
  }

  _getCommands() {
    const commandTable = this._getSimpleTable();
    this._program._commands
      // don't include default command
      .filter((c) => c.name() !== '')
      .forEach(cmd => {
        commandTable.push(
          [chalk.magenta(cmd.getSynopsis()), cmd.description()]
        );
      });
    commandTable.push([chalk.magenta('help <command>'), 'Display help for a specific command']);
    return chalk.bold('COMMANDS') + "\n\n" + colorize(commandTable.toString());
  }

  _getGlobalOptions() {
    const optionsTable = this._getSimpleTable();
    this._getPredefinedOptions().forEach(o => optionsTable.push(o));
    return chalk.bold('GLOBAL OPTIONS') + "\n\n" + colorize(optionsTable.toString());
  }

  _getCommandHelp(cmd) {
    const args = cmd.args();
    const options = cmd.options();
    let help = (cmd.name() ? cmd.name() + ' ' : '') + args.map(a => a.synopsis()).join(' ');

    help += this._renderHelp(cmd._name);

    if (args.length) {
      help += `\n\n   ${chalk.bold('ARGUMENTS')}\n\n`;
      const argsTable = this._getSimpleTable();
      args.forEach(a => {
        const def = a.hasDefault() ? 'default: ' + JSON.stringify(a.default()) : '';
        const req = a.isRequired() ? chalk.bold('required') : chalk.grey('optional');
        argsTable.push([a.synopsis(), a.description(), req, chalk.grey(def)])
      });
      help += argsTable.toString();
    }

    if (options.length) {
      help += `\n\n   ${chalk.bold('OPTIONS')}\n\n`;
      const optionsTable = this._getSimpleTable();
      options.forEach(a => {
        const def = a.hasDefault() ? 'default: ' + JSON.stringify(a.default()) : '';
        const req = a.isRequired() ? chalk.bold('required') : chalk.grey('optional');
        optionsTable.push([a.synopsis(), a.description(), req, chalk.grey(def)])
      });
      help += optionsTable.toString();
    }

    return help;
  }

  _getUsage(cmd) {
    let help = `${chalk.bold('USAGE')}\n\n     ${chalk.italic(this._program.name() || this._program.bin())} `;
    if (cmd) {
      help += colorize(this._getCommandHelp(cmd));
    } else {
      help += colorize('<command> [options]');
    }
    return help;
  }


  _getSimpleTable() {
    return new Table({
      chars: {
        'top': '', 'top-mid': '', 'top-left': '', 'top-right': ''
        , 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': ''
        , 'left': '', 'left-mid': '', 'mid': '', 'mid-mid': ''
        , 'right': '', 'right-mid': '', 'middle': ' '
      },
      style: {'padding-left': 5, 'padding-right': 0}
    });
  }

  _getPredefinedOptions() {
    return [['-h, --help', 'Display help'],
      ['-V, --version', 'Display version'],
      ['--no-color', 'Disable colors'],
      ['--quiet', 'Quiet mode - only displays warn and error messages'],
      ['-v, --verbose', 'Verbose mode - will also output debug messages']];
  }

  _renderHelp ( key ) {
    if (!this._customHelp[key]) return '';
    let rendered = '';
    this._customHelp[key].forEach (function(args) {
      const help = args[0];
      const options = args[1];
      if (options.name) {
        rendered += "\n\n   " + chalk.bold(options.name);
      }
      const parsedHelp = options.indent ? "     " + help.split ( '\n' ).join ( '\n     ' ) : help;
      rendered += "\n\n" + parsedHelp;
    });
    return rendered;
  }

}


module.exports = Help;

},{"./colorful":9,"chalk":undefined,"cli-table2":undefined,"lodash.merge":undefined}],11:[function(require,module,exports){
module.exports={
  "name": "ags-console",
  "version": "0.1.0",
  "description": "Command line application for AGS - AutoIt GUI Skeleton framework.",
  "AGS": {
    "framework": {
      "version": "1.0.0"
    },
    "AutoIt": {
      "version": "3.3.14.5"
    }
  },
  "keywords": [
    "AGS",
    "AutoIt",
    "AutoItGUISkeleton",
    "AutoIt GUI Skeleton",
    "au3"
  ],
  "main": "index-bundled.js",
  "bin": {
    "ags": "index-bundled.js"
  },
  "repository": {
    "url": "https://github.com/notyet.git",
    "type": "git"
  },
  "homepage": "https://github.com/notyet.git",
  "author": "20100 <vb20100bv@gmail.com> (https://github.com/v20100v)",
  "license": "MIT",
  "scripts": {
    "pkg": "pkg . --targets node10-win-x64 --output ./build/Ags",
    "package-x86": "pkg . --targets node10-win-x86 --output ./build/Ags-x86",
    "package-x64": "pkg . --targets node10-win-x64 --output ./build/Ags-x64",
    "bundle": ".\\node_modules\\.bin\\browserify.cmd index.js --no-bundle-external --no-builtins -o index-bundled.js"
  },
  "dependencies": {
    "@rauschma/stringio": "^1.4.0",
    "async": "^2.6.1",
    "boxen": "^1.3.0",
    "caporal": "^0.10.0",
    "chalk": "^2.4.1",
    "colors": "^1.3.0",
    "fast-glob": "^2.2.2",
    "inquirer": "^6.0.0",
    "nunjucks": "^3.1.3",
    "prettyjson": "^1.2.1",
    "replace-in-file": "^3.4.0",
    "request": "^2.87.0",
    "shelljs": "^0.8.2",
    "slug": "^0.9.1",
    "word-wrap": "^1.2.3"
  },
  "devDependencies": {
    "browserify": "^16.2.2",
    "pkg": "^4.3.3"
  },
  "pkg": {
    "assets": [
      "./templates/**/*",
      "./bin/**/*"
    ]
  }
}

},{}]},{},[1]);
