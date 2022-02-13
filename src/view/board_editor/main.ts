import { Board } from "./board";
import { VSCode } from "./vscode";

(async () => {
    new Board();
    await VSCode.init();
})();