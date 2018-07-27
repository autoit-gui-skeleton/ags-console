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
