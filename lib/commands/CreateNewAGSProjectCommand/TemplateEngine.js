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
                outputPath + '/*',
                outputPath + '/bin/**',
                outputPath + '/config/**',
                outputPath + '/deployment/**',
                outputPath + '/src/**',
                '!' + outputPath + '/vendor/**'
            ]);

            let changes = [];
            asyncjs.eachSeries(files, (file, callback) => {
                try {
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

                    console.log('[OK] All templates variables have been replaced.');
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
 * @returns {Promise<boolean>}
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