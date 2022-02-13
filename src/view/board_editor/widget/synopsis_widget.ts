

import { Synopsis } from "../../../model/synopsis";
import { Board } from "../board";
import { Widget } from "./widget";
import html from "./synopsis_widget.html";
import { SemanticVersion } from "../../../util/versioning";
import { VSCode } from "../vscode";

export class SynopsisWidget extends Widget<Synopsis, any> {
    constructor(board: Board, data: Synopsis) {
        super(board, data, html, "synopsis-widget");
        this.onRedraw = (element) => {
            element.querySelector('.icon').setAttribute('src', 'https://www.frangiclave.net/static/images/icons40/aspects/winter.png');
            const versionInput = element.querySelector('input[name="version"]') as HTMLInputElement;
            element.querySelectorAll('button[version-type]').forEach((button: HTMLButtonElement) => {
                const versionType = button.getAttribute('version-type');
                button.onclick = () => {
                    try {
                        switch (versionType) {
                            case "Major":
                                this.data.version = SemanticVersion.Parse(this.data.version).Major().toString();
                                break;
                            case "Minor":
                                this.data.version = SemanticVersion.Parse(this.data.version).Minor().toString();
                                break;
                            case "Patch":
                                this.data.version = SemanticVersion.Parse(this.data.version).Patch().toString();
                                break;
                            case "RC":
                                this.data.version = SemanticVersion.Parse(this.data.version).RC().toString();
                                break;
                            case "Beta":
                                this.data.version = SemanticVersion.Parse(this.data.version).Beta().toString();
                                break;
                            case "Stable":
                                this.data.version = SemanticVersion.Parse(this.data.version).Stable().toString();
                                break;
                        }
                        versionInput.value = this.data.version;
                        this.save();
                    } catch (e) {
                        VSCode.emitWarning("Not a semantic version");
                    }
                };
            });
            element.querySelectorAll('input[name]').forEach((input: HTMLInputElement) => {
                const fieldName = input.getAttribute('name');
                if (!(fieldName in this.data)) {
                    return;
                }
                input.value = this.data[fieldName];
                input.onkeyup = () => {
                    if (this.data[fieldName] == input.value) {
                        return;
                    }
                    this.data[fieldName] = input.value;
                    this.board.save();
                };
            });
        };
    }

}