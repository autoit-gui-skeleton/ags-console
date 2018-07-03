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
    if (typeof options.directory !== 'undefined' && options.directory !== null) {
        directory = path.resolve(options.directory);
    } else {
        directory = path.resolve(process.cwd() + '/.');
    }

    /**
     * The directory where binary Tidy.exe is store.
     *
     * @type {string}
     */
    const pathTidy = path.resolve(__dirname + "/../../../templates/default/bin/Tidy.exe");

    /**
     * Self invoking function use in order to run this command.
     *
     * @returns {Promise<void>}
     * @private
     */
    (async function _runCommand() {
        logger.title('Clean all AutoIt code source');

        try {
            const autoitFiles = await _findAutoItFiles();
            await _tidyFiles(autoitFiles);

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
    async function _findAutoItFiles() {
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
     * @returns {Promise<any>}
     * @private
     */
    async function _tidyFiles(autoitFiles) {
        return new Promise(async (resolve, reject) => {
            console.log('');
            logger.subtitle('2. Clean AutoIt files with Tidy');


            let cmdTidy = '"' + pathTidy + '" /keepnversions=0 /noshowdiffpgm /Remove_EndFun_comment /Remove_Endregion_Comment';
            if (logger.isVerbose()) {
                cmdTidy += ' /ShowConsoleInfo=9';
            }
            logger.debug('[INFO] tidy command to execute: ', colors.green(cmdTidy));

            asyncjs.eachSeries(autoitFiles, (autoitFile, callback) => {
                logger.debug('[INFO] Processing Tidy on file: ', colors.green(autoitFile));
                let cmdTmp = '"' + pathTidy + '" '
                    + ' "' + autoitFile + '"'
                    + ' /keepnversions=0 /noshowdiffpgm /Remove_EndFun_comment /Remove_Endregion_Comment';
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