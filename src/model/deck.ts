import { Entity } from "./entity";


interface IDeckSerialized {
    id: string
    label: string
    description: string
    resetonexhaustion: boolean
    spec: Array<string>
    spec$append: Array<string>
    spec$prepend: Array<string>
    spec$remove: Array<string>
    defaultcard: string
    comments: string
    drawmessages: Map<string, string>
    drawmessages$add: Map<string, string>
    drawmessages$remove: Array<string>
}

export class Deck extends Entity<IDeckSerialized> implements IDeckSerialized {
    // id
    public get id(): string {
        return this.get('id') || "";
    }
    public set id(value: string) {
        this.set('id', value);
    }

    // label
    public get label(): string {
        return this.get('label') || "";
    }
    public set label(value: string) {
        this.set('label', value);
    }

    // comments
    public get comments(): string {
        return this.get('comments') || "";
    }
    public set comments(value: string) {
        this.set('comments', value);
    }

    // description
    public get description(): string {
        return this.get('description') || "";
    }
    public set description(value: string) {
        this.set('description', value);
    }

    // resetonexhaustion
    public get resetonexhaustion(): boolean {
        return this.get('resetonexhaustion') || false;
    }
    public set resetonexhaustion(value: boolean) {
        this.set('resetonexhaustion', value);
    }

    // spec
    public get spec(): Array<string> {
        return this.get('spec');
    }
    public set spec(value: Array<string>) {
        this.set('spec', value);
    }

    // spec$append
    public get spec$append(): string[] {
        return this.get('spec$append');
    }
    public set spec$append(value: string[]) {
        this.set('spec$append', value);
    }

    // spec$prepend
    public get spec$prepend(): string[] {
        return this.get('spec$prepend');
    }
    public set spec$prepend(value: string[]) {
        this.set('spec$prepend', value);
    }

    // spec$remove
    public get spec$remove(): string[] {
        return this.get('spec$remove');
    }
    public set spec$remove(value: string[]) {
        this.set('spec$remove', value);
    }

    // defaultcard
    public get defaultcard(): string {
        return this.get('defaultcard') || "";
    }
    public set defaultcard(value: string) {
        this.set('defaultcard', value);
    }

    // drawmessages
    public get drawmessages(): Map<string, string> {
        return this.get('drawmessages');
    }
    public set drawmessages(value: Map<string, string>) {
        this.set('drawmessages', value);
    }

    // drawmessages$add
    public get drawmessages$add(): Map<string, string> {
        return this.get('drawmessages$add');
    }
    public set drawmessages$add(value: Map<string, string>) {
        this.set('drawmessages$add', value);
    }

    // drawmessages$remove
    public get drawmessages$remove(): Array<string> {
        return this.get('drawmessages$remove');
    }
    public set drawmessages$remove(value: Array<string>) {
        this.set('drawmessages$remove', value);
    }

    public toJSON(): IDeckSerialized {
        return {
            id: this.get('id'),
            label: this.get('label'),
            description: this.get('description'),
            resetonexhaustion: this.get('resetonexhaustion'),
            spec: !this.get('spec') ? void 0 : this.get('spec'),
            spec$append: this.get('spec') ? void 0 : this.get('spec$append'),
            spec$prepend: this.get('spec') ? void 0 : this.get('spec$prepend'),
            spec$remove: this.get('spec') ? void 0 : this.get('spec$remove'),
            defaultcard: this.get('defaultcard'),
            drawmessages: !this.get('drawmessages') ? void 0 : this.get('drawmessages'),
            drawmessages$add: this.get('drawmessages') ? void 0 : this.get('drawmessages$add'),
            drawmessages$remove: this.get('drawmessages') ? void 0 : this.get('drawmessages$remove'),
            comments: this.get('comments')
        };
    }

    public fromJSON(obj: IDeckSerialized): Deck {
        this.id = obj?.id || this.get('id');
        this.label = obj?.label || this.get('label');
        this.description = obj?.description || this.get('description');
        this.resetonexhaustion = obj?.resetonexhaustion || this.get('resetonexhaustion');
        this.spec = obj?.spec || this.get('spec');
        this.spec$append = obj?.spec$append || this.get('spec$append');
        this.spec$prepend = obj?.spec$prepend || this.get('spec$prepend');
        this.spec$remove = obj?.spec$remove || this.get('spec$remove');
        this.defaultcard = obj?.defaultcard || this.get('defaultcard');
        this.drawmessages = obj?.drawmessages || this.get('drawmessages');
        this.drawmessages$add = obj?.drawmessages$add || this.get('drawmessages$add');
        this.drawmessages$remove = obj?.drawmessages$remove || this.get('drawmessages$remove');
        this.comments = obj?.comments || this.get('comments');
        return this;
    }
}