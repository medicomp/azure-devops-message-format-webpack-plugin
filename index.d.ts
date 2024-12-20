interface AzureDevOpsMessageFormatWebpackPlugin {
    apply(compiler: import('webpack').Compiler): void;
}

interface AzureDevOpsMessageFormatWebpackPluginConstructor {
    new(): AzureDevOpsMessageFormatWebpackPlugin;
    prototype: AzureDevOpsMessageFormatWebpackPlugin;
}

declare module 'azure-devops-message-format-webpack-plugin' {
    const exportItem: AzureDevOpsMessageFormatWebpackPluginConstructor;
    export = exportItem;
}