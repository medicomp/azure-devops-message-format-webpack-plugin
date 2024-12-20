# azure-devops-message-format-webpack-plugin

[Webpack](https://webpack.js.org/) plugin that formats build messages using [Azure DevOps pipelines logging commands](https://learn.microsoft.com/en-us/azure/devops/pipelines/scripts/logging-commands?view=azure-devops&tabs=bash) so that warnings are tagged appropriately in build logs.  So this:

```
Libraries/quippe-client/libs/qwc/utilities/skin-manager.js:141:26-33 - Warning: Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
```

...becomes this:

```
##vso[task.logissue type=warning;sourcepath=R:\Libraries\quippe-client\libs\qwc\utilities\skin-manager.js;linenumber=141;columnnumber=26]Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
```

## Installation

```terminal
$ npm install --save-dev azure-devops-message-format-webpack-plugin
```

## Usage

Simply import the plugin and add it to the plugins collection in your *webpack.config.js*:

```javascript
const AzureDevOpsMessageFormatWebpackPlugin = require('azure-devops-message-format-webpack-plugin');

// ...

config.plugins.push(new AzureDevOpsMessageFormatWebpackPlugin());
```