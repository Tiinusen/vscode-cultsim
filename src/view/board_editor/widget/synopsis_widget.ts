

import { Synopsis } from "../../../model/synopsis";
import { Board } from "../board";
import { Widget } from "./widget";
import html from "./synopsis_widget.html";
import { SemanticVersion } from "../../../util/versioning";
import { VSCode } from "../vscode";

export class SynopsisWidget extends Widget<Synopsis, any> {
    constructor(board: Board, data: Synopsis) {
        super(board, data, html, "synopsis-widget");

    }

    onRedraw() {
        this.element.querySelector('.icon').setAttribute('src', 'https://www.frangiclave.net/static/images/icons40/aspects/winter.png');
        this.element.querySelectorAll('button[version-type]').forEach((button: HTMLButtonElement) => {
            button.onclick = () => this.onSelectVersionType(button.getAttribute('version-type'));
        });
        this.element.querySelectorAll('input[name]').forEach((input: HTMLInputElement) => this.bindInput(input));
    }

    onSelectVersionType(versionType: string) {
        try {
            const versionInput = this.element.querySelector('input[name="version"]') as HTMLInputElement;
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
    }

}