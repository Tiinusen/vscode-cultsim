import { Deck } from "./deck";
import { CElement } from "./element";
import { Ending } from "./ending";
import { Entity } from "./entity";
import { Legacy } from "./legacy";
import { Recipe } from "./recipe";
import { Synopsis } from "./synopsis";
import { Verb } from "./verb";
import { SerializationHelper } from "../util/serialization";
import { FileType, Uri, workspace } from "vscode";

export enum ContentType {
    Unknown,
    Unspecified,
    Mixed,
    Synopsis,
    Elements,
    Recipes,
    Decks,
    Legacies,
    Endings,
    Verbs
}

export class Content {
    private _synopsis: Synopsis = null;
    private _elements: Array<CElement> = [];
    private _recipes: Array<Recipe> = [];
    private _decks: Array<Deck> = [];
    private _legacies: Array<Legacy> = [];
    private _endings: Array<Ending> = [];
    private _verbs: Array<Verb> = [];
    private _type: ContentType = ContentType.Unspecified;

    get type(): ContentType {
        return this._type;
    }
    set type(value: ContentType) {
        if (this._type != ContentType.Unspecified && this._type != value) {
            this._type = ContentType.Mixed;
            return;
        }
        this._type = value;
    }

    get synopsis(): Synopsis {
        return this._synopsis;
    }

    get elements(): Array<CElement> {
        return this._elements;
    }

    get recipes(): Array<Recipe> {
        return this._recipes;
    }

    get decks(): Array<Deck> {
        return this._decks;
    }

    get legacies(): Array<Legacy> {
        return this._legacies;
    }

    get endings(): Array<Ending> {
        return this._endings;
    }

    get verbs(): Array<Verb> {
        return this._verbs;
    }

    constructor(data: object | string = null) {
        SerializationHelper.toInstance(this, data);
    }

    public clone(): Content {
        const content = new Content();
        this._elements.forEach(element => content.add(new CElement(element.toJSON())));
        this._recipes.forEach(recipe => content.add(new Recipe(recipe.toJSON())));
        this._decks.forEach(deck => content.add(new Deck(deck.toJSON())));
        this._legacies.forEach(legacy => content.add(new Legacy(legacy.toJSON())));
        this._endings.forEach(ending => content.add(new Ending(ending.toJSON())));
        this._verbs.forEach(verb => content.add(new Verb(verb.toJSON())));
        return content;
    }

    /**
     * Does a merge and returns a new content without modifying source
     * 
     * @param from data that will overwrite source
     * @returns itself
     */
    public merge(from: Content = null): Content {
        if (from == null) {
            return this;
        }
        const content = this.clone();
        try {
            from._elements.forEach(element => content._elements.find(item => element.id == item.id)?.fromJSON(element) || content.add(element));
            from._recipes.forEach(recipe => content._recipes.find(item => recipe.id == item.id)?.fromJSON(recipe) || content.add(recipe));
            from._decks.forEach(deck => content._decks.find(item => deck.id == item.id)?.fromJSON(deck) || content.add(deck));
            from._legacies.forEach(legacy => content._legacies.find(item => legacy.id == item.id)?.fromJSON(legacy) || content.add(legacy));
            from._endings.forEach(ending => content._endings.find(item => ending.id == item.id)?.fromJSON(ending) || content.add(ending));
            from._verbs.forEach(verb => content._verbs.find(item => verb.id == item.id)?.fromJSON(verb) || content.add(verb));
        } catch (e) {
            console.error(e);
        }
        return content;
    }

    public has(entity: Entity<any>): boolean {
        if (entity instanceof Synopsis) {
            return entity == this.synopsis;
        } else if (entity instanceof CElement) {
            return this.elements.some(element => element.id == entity.id);
        } else if (entity instanceof Recipe) {
            return this.recipes.some(recipe => recipe.id == entity.id);
        } else if (entity instanceof Deck) {
            return this.decks.some(deck => deck.id == entity.id);
        } else if (entity instanceof Legacy) {
            return this.legacies.some(legacy => legacy.id == entity.id);
        } else if (entity instanceof Ending) {
            return this.endings.some(ending => ending.id == entity.id);
        } else if (entity instanceof Verb) {
            return this.verbs.some(verb => verb.id == entity.id);
        }
        return false;
    }

    public add<T>(entity: T): T {
        if (this.has(entity as any)) {
            console.log("already in content collection, merge not implemented");
            return entity;
        }
        if (entity instanceof Synopsis) {
            this.type = ContentType.Synopsis;
            this._synopsis = entity;
        } else if (entity instanceof CElement) {
            this.type = ContentType.Elements;
            this._elements.push(entity);
        } else if (entity instanceof Recipe) {
            this.type = ContentType.Recipes;
            this._recipes.push(entity);
        } else if (entity instanceof Deck) {
            this.type = ContentType.Decks;
            this._decks.push(entity);
        } else if (entity instanceof Legacy) {
            this.type = ContentType.Legacies;
            this._legacies.push(entity);
        } else if (entity instanceof Ending) {
            this.type = ContentType.Endings;
            this._endings.push(entity);
        } else if (entity instanceof Verb) {
            this.type = ContentType.Verbs;
            this._verbs.push(entity);
        } else {
            throw new Error("add is unsupported for provided entity");
        }
        return entity;
    }

    public remove(entity: Entity<any>) {
        if (entity instanceof Synopsis) {
            this._synopsis = entity;
        } else if (entity instanceof CElement) {
            this._elements = this._elements.filter((element) => element.id != entity.id);
        } else if (entity instanceof Recipe) {
            this._recipes = this._recipes.filter((recipe) => recipe.id != entity.id);
        } else if (entity instanceof Deck) {
            this._decks = this._decks.filter((deck) => deck.id != entity.id);
        } else if (entity instanceof Legacy) {
            this._legacies = this._legacies.filter((legacy) => legacy.id != entity.id);
        } else if (entity instanceof Ending) {
            this._endings = this._endings.filter((ending) => ending.id != entity.id);
        } else if (entity instanceof Verb) {
            this._verbs = this._verbs.filter((verb) => verb.id != entity.id);
        } else {
            throw new Error("add is unsupported for provided entity");
        }
    }

    private static _coreContent = null;
    static async fromCore() {
        if (this._coreContent) {
            return this._coreContent;
        }
        const streamingAssetsPath: string = workspace.getConfiguration('cultsim').get('streamingAssetsPath');
        if (!streamingAssetsPath) return null;
        const streamingAssetsURI = Uri.joinPath(Uri.file(streamingAssetsPath), "content", "core");

        this._coreContent = this.fromFolder(streamingAssetsURI);
        return this._coreContent;
    }

    static async fromFolder(path: Uri): Promise<Content> {
        let content = new Content();
        const filesAndFolders = await workspace.fs.readDirectory(path);
        for (const [name, typ] of filesAndFolders) {
            const ipath = Uri.joinPath(path, name);
            switch (typ) {
                case FileType.Directory:
                    content = content.merge(await this.fromFolder(ipath));
                    continue;
                case FileType.File:
                    if (!ipath.fsPath.endsWith(".json")) {
                        continue;
                    }
                    content = content.merge(await this.fromFile(ipath));
                    continue;
            }
        }
        return content;
    }

    static async fromFile(path: Uri): Promise<Content> {
        const jsonString = (await workspace.fs.readFile(path)).toString();
        if (jsonString.trim().length == 0) {
            return null;
        }
        return this.fromString(jsonString);
    }

    static fromString(jsonString: string): Content {
        let jsonObj = null;
        try {
            jsonObj = JSON.parse(jsonString);
        } catch (e) {
            if (jsonString.trim().length == 0) {
                return new Content();
            }
            return null;
        }
        return new Content(jsonObj);
    }

    public fromJSON(obj: any) {
        if (obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype) {
            return;
        }
        if ('name' in obj && 'author' in obj) {
            this.add(new Synopsis(obj));
        } else if ('verbs' in obj) {
            this.type = ContentType.Verbs;
            for (const item of obj['verbs']) {
                this.add(new Verb(item));
            }
        } else if ('elements' in obj) {
            this.type = ContentType.Elements;
            for (const item of obj['elements']) {
                this.add(new CElement(item));
            }
        } else if ('recipes' in obj) {
            this.type = ContentType.Recipes;
            for (const item of obj['recipes']) {
                this.add(new Recipe(item));
            }
        } else if ('decks' in obj) {
            this.type = ContentType.Decks;
            for (const item of obj['decks']) {
                this.add(new Deck(item));
            }
        } else if ('legacies' in obj) {
            this.type = ContentType.Legacies;
            for (const item of obj['legacies']) {
                this.add(new Legacy(item));
            }
        } else if ('endings' in obj) {
            this.type = ContentType.Endings;
            for (const item of obj['endings']) {
                this.add(new Ending(item));
            }
        } else {
            this.type = ContentType.Unknown;
        }
    }

    public toJSON(): object {
        switch (this.type) {
            case ContentType.Unspecified:
                throw new Error("Content type has not yet been determined, so there is no valid file format");
            case ContentType.Mixed:
                throw new Error("Content has more than one type of content, so there is no valid file format");
            case ContentType.Synopsis:
                return this?._synopsis.toJSON() || {};
            case ContentType.Elements:
                return {
                    "elements": this?._elements?.map(element => element.toJSON()) || []
                };
            case ContentType.Recipes:
                return {
                    "recipes": this?._recipes?.map(recipe => recipe.toJSON()) || []
                };
            case ContentType.Decks:
                return {
                    "decks": this?._decks?.map(deck => deck.toJSON()) || []
                };
            case ContentType.Legacies:
                return {
                    "legacies": this?._legacies?.map(legacie => legacie.toJSON()) || []
                };
            case ContentType.Endings:
                return {
                    "endings": this?._endings?.map(ending => ending.toJSON()) || []
                };
            case ContentType.Verbs:
                return {
                    "verbs": this?._verbs?.map(verb => verb.toJSON()) || []
                };
            default:
                throw new Error("Unknown Content Type: " + this.type);
        }
    }
}