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