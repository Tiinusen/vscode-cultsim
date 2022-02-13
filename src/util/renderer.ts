import path = require("path");
import { Uri, Webview, workspace } from "vscode";
import { newNonce } from "./helpers";

export class Renderer {
    static async htmlForWebView(webview: Webview, assetsHtmlURI: Uri, assetsBaseURI: Uri, ...assets: string[]): Promise<string> {
        const nonce = newNonce();
        const securitySection = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';" />` + "\n";
        let stylesheetSection = "";
        let scriptsSection = "";

        for (const asset of assets) {
            const uri = Uri.joinPath(assetsBaseURI, ...asset.split("/"));
            const ext = path.extname(uri.fsPath);
            switch (ext) {
                case ".css":
                    stylesheetSection += '<link href="' + webview.asWebviewUri(uri) + '" rel="stylesheet" />' + "\n";
                    break;
                case ".js":
                    scriptsSection += '<script nonce="' + nonce + '" type="text/javascript" src="' + webview.asWebviewUri(uri) + '"></script>' + "\n";
                    break;
            }
        }

        const template = (await workspace.fs.readFile(assetsHtmlURI)).toString()
            .replace('<!-- Security -->', securitySection)
            .replace('<!-- Stylesheets -->', stylesheetSection)
            .replace('<!-- Scripts -->', scriptsSection)
            .replace('{assets-base}', webview.asWebviewUri(assetsBaseURI).toString())
            .replace('{nonce}', nonce);
        return template;
    }
}