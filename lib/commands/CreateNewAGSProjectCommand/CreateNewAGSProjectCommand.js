/*
 * Copyright (c) 2018, AGS
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
const fastGlob = require('fast-glob');
const replaceInFile = require('replace-in-file');


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
     * The output directory where the new AGS project is generate. It's declared into the module scope, and
     * defined in the first method _inquirerConfigurationAGS() call when the command is run.
     *
     * @type {string}
     */
    let outputPath = '';

    /**
     * The template variables are asked to user with the method _inquirerConfigurationAGS.
     * Tye are used to replace the placeholder values, by iterate and read all template files.
     *
     * @type {string[]}
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
            await _createOutputDirectory();
            await _copyTemplateFiles();
            await _renamingFileVariables(configurationAGS);
            await _replacingTemplateVariables(configurationAGS);

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
                        // set outputPath directory (declare in module scope)
                        if (output === undefined) {
                            outputPath = path.resolve(process.cwd() + "/" + answersConfiguration.projectAGSName);
                        } else {
                            outputPath = path.resolve(process.cwd() + "/" + output + "/" + answersConfiguration.projectAGSName);
                        }
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
     * @returns {Promise<*>}
     * @private
     */
    async function _createOutputDirectory() {
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
     * @returns {Promise<*>}
     * @private
     */
    async function _copyTemplateFiles() {
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


    /**
     * Parse templateVariables in order to build all regexp and associated value used to replacing template variables.
     *
     * @returns {{patternRegex: Array, valueForPatternRegex: *}}
     * @private
     */
    function _regexsTemplatesVariable(configurationAGS) {
        let regexPatterns = [];
        let regexValuesForPatterns = [];
        templateVariables.forEach(variable => {
            regexPatterns.push(new RegExp('{%' + variable + '%}', 'g'));
            regexValuesForPatterns.push(configurationAGS[variable]);
        });
        return {regexPatterns: regexPatterns, regexValuesForPatterns: regexValuesForPatterns};
    }


    /**
     * Renaming all files in output directory which contains template variables in a part of its name.
     *
     * @param configurationAGS
     * @returns {Promise<*>}
     * @private
     */
    async function _renamingFileVariables(configurationAGS) {
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
     * @returns {Promise<*>}
     * @private
     */
    async function _replacingTemplateVariables(configurationAGS) {
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
                    templateVariables.forEach(variable => {
                        logger.debug('[INFO] Template variable '
                            + colors.green(variable) + ' is equals to '
                            + colors.cyan(configurationAGS[variable]));
                        if (configurationAGS[variable] === undefined || configurationAGS[variable] == null) {
                            logger.warn('[KO] The template variable ' + colors.bold(variable) + ' doesn\'t have value into the configuration.');
                            checkTemplateVariables = false;
                        }
                    });
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
                let regexsTemplatesVariable = _regexsTemplatesVariable(configurationAGS);
                replaceInFile({
                    files: [
                        outputPath + '/*',
                        outputPath + '/bin/**',
                        outputPath + '/config/**',
                        outputPath + '/deployment/**',
                        outputPath + '/src/**'
                    ],
                    ignore: outputPath + '/vendor/**',
                    from: regexsTemplatesVariable.regexPatterns,
                    to: regexsTemplatesVariable.regexValuesForPatterns,
                    allowEmptyPaths: true
                }).then(changes => {
                    logger.debug('[INFO] Replacing variables impact ' + changes.length + ' files: ', changes);

                    console.log('[OK] All templates variables have been replaced.');
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    }

};