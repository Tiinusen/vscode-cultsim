import * as L from 'leaflet';
import { Board } from '../board';
import { VSCode } from '../vscode';
import { BoardOverlay } from './board_overlay';
import html from './pick_id_image_overlay.html';

export class PickIDImageOverlay extends BoardOverlay {
    constructor(board: Board) {
        super(html, board);
    }

    onInit() {
        VSCode.emitInfo("works");
    }
}