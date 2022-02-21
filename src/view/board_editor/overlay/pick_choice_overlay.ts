import { setDebounce } from '../../../util/helpers';
import { Board } from '../board';
import { VSCode } from '../vscode';
import { BoardOverlay } from './board_overlay';
import html from './pick_choice_overlay.html';

export class PickChoiceOverlay extends BoardOverlay {

    private _options: string[];

    private onPick?(id: string): void

    constructor(board: Board, attachTo?: HTMLElement) {
        super(html, board, attachTo);
    }

    protected async onInit() {
        //
    }


    /**
     * Opens dialog and resolves once user has performed expected action or closed dialog
     */
    public async pick(...options: string[]): Promise<string> {
        this._options = options;
        return new Promise((resolve, reject) => {
            const div = this.element.querySelector('.pick-choice');
            div.innerHTML = "";
            for (const option of this._options) {
                const button = document.createElement('button');
                button.innerText = option;
                button.onclick = () => this?.onPick(option);
                div.appendChild(button);
            }
            this.onPick = (id: string) => {
                this.hide();
                resolve(id);
            };
            this.onClickOutside = () => {
                this.hide();
                reject("closed");
            };
            this.show();
        });
    }
}