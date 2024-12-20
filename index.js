const exportRegex = /\s*(.+?)\s*(")?export '(.+?)' was not found in '(.+?)'/;
const stackRegex = /^\s*at\s((?!webpack:).)*:\d+:\d+[\s\)]*(\n|$)/gm;

class AzureDevOpsMessageFormatWebpackPlugin {
    /**
     * @returns {void}
     * @param {import('webpack').Compiler} compiler
     */
    apply(compiler) {
        const pluginName = this.constructor.name;

        if (process.env['TF_BUILD']) {
            compiler.hooks.done.tap(pluginName, stats => {
                const { errors, warnings } = stats.toJson();

                if ((warnings && warnings.length > 0) || (errors && errors.length > 0)) {
                    console.log('');
                }

                if (warnings) {
                    for (let warning of warnings) {
                        console.log(this.formatMessage(warning));
                    }
                }

                if (errors) {
                    for (let error of errors) {
                        console.log(this.formatMessage(error));
                    }
                }
            });
        }
    }

    /**
     * @returns {string}
     * @param {import('webpack').StatsError} messageMetadata
     */
    formatMessage(messageMetadata) {
        let message = messageMetadata.message;
        let lines = message.split('\n');

        if (lines.length > 2 && lines[1] === '') {
            lines.splice(1, 1);
        }
    
        // Remove loader notation from filenames:
        //   `./~/css-loader!./src/App.css` ~~> `./src/App.css`
        if (lines[0].lastIndexOf('!') !== -1) {
            lines[0] = lines[0].substr(lines[0].lastIndexOf('!') + 1);
        }
    
        // Remove useless `entry` filename stack details
        lines = lines.filter(line => line.indexOf(' @ ') !== 0);
    
        // 0 ~> filename; 1 ~> main err msg
        if (lines[0] && lines[1]) {
            // Cleans up verbose "module not found" messages for files and packages.
            if (lines[1].startsWith('Module not found: ')) {
                lines = [
                    lines[0],
                    lines[1] // "Module not found: " is enough detail
                        .replace("Cannot resolve 'file' or 'directory' ", '')
                        .replace('Cannot resolve module ', '')
                        .replace('Error: ', '')
                        .replace('[CaseSensitivePathsPlugin] ', '')
                ];
            }
        
            // Cleans up syntax error messages.
            if (lines[1].startsWith('Module build failed: ')) {
                lines[1] = lines[1].replace('Module build failed: SyntaxError:', 'Syntax error:');
            }
        
            if (lines[1].match(exportRegex)) {
                lines[1] = lines[1].replace(exportRegex, "$1 '$4' does not contain an export named '$3'.");
            }
        }

        message = '##vso[task.logissue type=warning';

        if (messageMetadata.moduleIdentifier) {
            message += ';sourcepath=' + (messageMetadata.moduleIdentifier.indexOf('!') !== -1 ? messageMetadata.moduleIdentifier.substr(messageMetadata.moduleIdentifier.lastIndexOf('!') + 1) : messageMetadata.moduleIdentifier);
        }

        if (messageMetadata.loc) {
            let [lineNumber, columnNumber] = messageMetadata.loc.split(':');

            if (columnNumber.indexOf('-') !== -1) {
                columnNumber = columnNumber.split('-')[0];
            }

            message += ';linenumber=' + lineNumber + ';columnnumber=' + columnNumber;
        }

        // Reassemble and strip internal tracing, except `webpack:`
        message += ']' + lines.join('\n').replace(stackRegex, '').trim();
        return message;
    }
}

module.exports = AzureDevOpsMessageFormatWebpackPlugin;