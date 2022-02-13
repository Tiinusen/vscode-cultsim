

import { Board } from "../board";
import { Widget } from "./widget";
import html from "./select_content_type_widget.html";
import { ContentType } from "../../../model/content";

export class SelectContentTypeWidget extends Widget<any, any> {
    constructor(board: Board) {
        super(board, {}, html, "select-content-type-widget");
        this.onRedraw = (element) => {
            element.querySelector('.icon').setAttribute('src', 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png');
            (element.querySelector('button[content="Elements"]') as HTMLButtonElement).onclick = () => {
                this.board.content.type = ContentType.Elements;
                this.board.save();
                this.board.redraw();
            };
            (element.querySelector('button[content="Recipes"]') as HTMLButtonElement).onclick = () => {
                this.board.content.type = ContentType.Recipes;
                this.board.save();
                this.board.redraw();
            };
            (element.querySelector('button[content="Decks"]') as HTMLButtonElement).onclick = () => {
                this.board.content.type = ContentType.Decks;
                this.board.save();
                this.board.redraw();
            };
            (element.querySelector('button[content="Legacies"]') as HTMLButtonElement).onclick = () => {
                this.board.content.type = ContentType.Legacies;
                this.board.save();
                this.board.redraw();
            };
            (element.querySelector('button[content="Endings"]') as HTMLButtonElement).onclick = () => {
                this.board.content.type = ContentType.Endings;
                this.board.save();
                this.board.redraw();
            };
            (element.querySelector('button[content="Verbs"]') as HTMLButtonElement).onclick = () => {
                this.board.content.type = ContentType.Verbs;
                this.board.save();
                this.board.redraw();
            };

            // element.querySelectorAll('input[name]').forEach((input: HTMLInputElement) => {
            //     const fieldName = input.getAttribute('name');
            //     if (!(fieldName in this.data)) {
            //         return;
            //     }
            //     input.value = this.data[fieldName];
            //     input.onkeyup = () => {
            //         if (this.data[fieldName] == input.value) {
            //             return;
            //         }
            //         this.data[fieldName] = input.value;
            //         this.board.save();
            //     };
            // });
        };
    }

}