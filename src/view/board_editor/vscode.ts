
import { Content } from "../../model/content";
import { BOARD_SIZE_HEIGHT, BOARD_SIZE_WIDTH } from "./board";
import { BoardState } from "./state";
import { IWidgetState } from "./widget/widget";

export class VSCode {
    private static _vscode = null;
    private static _initialized = false;
    public static state: BoardState;

    public static onStateChange: (state: BoardState) => void;

    public static async init() {
        if (this._initialized) {
            return;
        }

        this._initialized = true;

        this._vscode = acquireVsCodeApi();

        // Listeners
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'change':
                    if (this.state.document == message.document) {
                        return;
                    }
                    this.state.document = message.document;
                    this.saveState();
                    this.triggerStateChange();
                    return;
            }
        });

        this.loadState();
    }

    public static loadState() {
        try {
            this.state = JSON.parse(this._vscode.getState(), (key, value) => {
                if (key == "widgetState") {
                    return new Map<string, IWidgetState>(value);
                }
                return value;
            });
            if (!this.state?.document) throw new Error("document key is missing");
            if (!this.state?.widgetState) throw new Error("widgetState key is missing");
            if (!this.state?.widgetState || !(this.state.widgetState instanceof Map)) {
                this.state.widgetState = new Map<string, IWidgetState>(this.state?.widgetState ? Object.entries(this.state?.widgetState) : null);
            }
        } catch {
            this.state = {
                document: null,
                widgetState: new Map<string, IWidgetState>(),
                camera: [BOARD_SIZE_WIDTH / 2, BOARD_SIZE_HEIGHT / 2]
            };
        }
        this.triggerStateChange();
    }

    public static saveState() {
        const str = JSON.stringify(this.state, (key, value) => {
            if (value instanceof Map) {
                return Array.from(value.entries());
            } else {
                return value;
            }
        }, "\t");
        this._vscode.setState(str);
    }

    private static _saveDebouncer = null;
    public static save(content: Content, force = false) {
        const document = JSON.stringify(content, null, "\t");
        if (document == this.state.document) {
            return;
        }
        if (this._saveDebouncer) {
            clearTimeout(this._saveDebouncer);
        }
        if (!this.onStateChange) {
            return;
        }
        this._saveDebouncer = setTimeout(() => {
            this._saveDebouncer = null;
            this.state.document = document;
            this.saveState();
            this.emitChange(this.state.document);
        }, 100);
    }

    private static _changeDebouncer = null;
    private static triggerStateChange() {
        if (this._changeDebouncer) {
            clearTimeout(this._changeDebouncer);
        }
        if (!this.onStateChange) {
            return;
        }
        this._changeDebouncer = setTimeout(() => {
            this._changeDebouncer = null;
            this.onStateChange(this.state);
        }, 100);
    }

    public static emitToggleEditor(message?: string) {
        this.emit('toggle-editor', {
            message: message
        });
    }

    public static emitReload(message?: string) {
        this.emit('reload', {
            message: message
        });
    }

    public static emitError(e: Error | string) {
        let message = e;
        if (typeof e === 'object') {
            message = e.message;
        }
        this.emit('error', {
            message: message
        });
    }

    public static emitInfo(message: string) {
        this.emit('info', {
            message: message
        });
    }
    public static emitWarning(message: string) {
        this.emit('warning', {
            message: message
        });
    }
    public static emitChange(document: string) {
        this.emit('change', {
            document: document
        });
    }

    public static emit(type, payload = null) {
        this.init();
        const message = {
            type: type,
        };
        if (payload) {
            for (const key in payload) {
                message[key] = payload[key];
            }
        }
        this._vscode.postMessage(message);
    }

    public static getWidgetState(key: string): IWidgetState {
        let state = this.state.widgetState.get(key);
        if (!state) {
            state = {} as IWidgetState;
        }
        return state;
    }

    public static setWidgetState(key: string, value: IWidgetState) {
        this.state.widgetState.set(key, value);
        this.saveState();
    }

    public static clearWidgetState(keepKeeys: string[]) {
        // Todo: Implement clean-up
    }
}