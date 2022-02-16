import { Content, ContentType } from "../../model/content";
import { BoardState } from "./state";
import { VSCode } from "./vscode";
import * as L from 'leaflet';
import { IWidgetState, Widget } from "./widget/widget";
import { xy } from "../../util/leaflet";
import { SynopsisWidget } from "./widget/synopsis_widget";
import { SelectContentTypeWidget } from "./widget/select_content_type_widget";
import { Verb } from "../../model/verb";
import { VerbWidget } from "./widget/verb_widget";
import { Entity } from "../../model/entity";
import { BottomHUD } from "./hud/bottom_hud";
import { Arrange } from "../../util/layout";
import { PickIDImageOverlay } from "./overlay/pick_id_image_overlay";
import { setDebounce } from "../../util/helpers";

export const BOARD_SIZE_WIDTH = 1920;
export const BOARD_SIZE_HEIGHT = 1104;
export class Board {
    private _assetsBase = null;
    private _map: L.Map;
    private _bottomHUD: BottomHUD = null;
    private _pickIDImageOverlay: PickIDImageOverlay = null;
    private _widgets: Array<any> = [];
    private _bounds = L.latLngBounds(xy(0, 0), xy(BOARD_SIZE_WIDTH, BOARD_SIZE_HEIGHT));
    private _content?: Content;

    public get hud(): BottomHUD {
        return this._bottomHUD;
    }

    public get pickIDImageOverlay(): PickIDImageOverlay {
        return this._pickIDImageOverlay;
    }

    public get map(): L.Map {
        return this._map;
    }

    public get bounds(): L.LatLngBounds {
        return this._bounds;
    }

    public get widgets(): Array<any> {
        return this._widgets;
    }

    public get content(): Content {
        return this._content;
    }

    public get x(): number {
        return this.xy[0];
    }

    public get y(): number {
        return this.xy[1];
    }

    public get xy(): [number, number] {
        const latlng = this.map.getCenter();
        return [
            latlng.lng,
            latlng.lat
        ];
    }
    public set xy(xy: [number, number]) {
        if (this.xy != xy) {
            this.map.panTo([xy[1], xy[0]], {
                animate: false,
                noMoveStart: false
            });
        }
        if (VSCode.state?.camera?.[0] == xy[0] && VSCode.state?.camera?.[1] == xy[1]) {
            return;
        }
        VSCode.state.camera = xy;
        VSCode.saveState();
    }

    public set latlng(latlng: L.LatLng) {
        this.xy = [latlng.lng, latlng.lat];
    }

    constructor() {
        try {
            // Init
            this._assetsBase = document.body.getAttribute("assets-base");

            // Map
            this._map = L.map('board', {
                crs: L.CRS.Simple,
                zoomControl: false,
                minZoom: 0,
                maxZoom: 0,
                zoom: 0,
                maxBounds: this.bounds,
                maxBoundsViscosity: 1.0
            });

            L.imageOverlay(this._assetsBase + '/img/board.png', this.bounds).addTo(this.map);
            this.map.fitBounds(this.bounds);
            document.getElementsByClassName('leaflet-control-attribution')[0]['style'].display = 'none';

            this.map.on('dragend', (e) => {
                this.latlng = this.map.getCenter();
            });

            VSCode.onStateChange = (state: BoardState) => this.update(state);
        } catch (e) {
            VSCode.emitError(e);
        }
    }

    private async update(state: BoardState) {
        try {
            const init = !this._content;
            this._content = Content.fromString(state.document);
            this.redraw(init);
            if (init) {
                this.xy = state.camera;
                if (VSCode.state.widgetState.size == 0) {
                    Arrange.Grid(this.widgets, this.map.getBounds());
                }
                VSCode.saveState();
            }
        } catch (e) {
            VSCode.emitError(e);
        }
    }

    public async redraw(init = false) {
        try {
            if (init) {
                this._pickIDImageOverlay = new PickIDImageOverlay(this);
            }

            if (this.content == null) {
                for (const widget of this.widgets) {
                    widget.remove();
                }
                this._widgets = [];
                if (this._bottomHUD) {
                    this.map.removeControl(this._bottomHUD);
                    this._bottomHUD = null;
                }
                return;
            }

            // Update/Remove
            this._widgets = this.widgets.filter((widget: any) => {
                if (widget instanceof SelectContentTypeWidget) {
                    if (this.content.type == ContentType.Unspecified) {
                        return true;
                    }
                } else if (widget instanceof SynopsisWidget) {
                    if (this.content.type == ContentType.Synopsis) {
                        widget.data = this.content.synopsis;
                        return true;
                    }
                } else if (widget instanceof VerbWidget) {
                    if (this.content.type == ContentType.Verbs) {
                        const data = this.content.verbs.find(verb => verb.id == widget.data.id);
                        if (data) {
                            widget.data = data;
                            return true;
                        }
                    }
                }
                this.removeWidget(widget);
                return false;
            });

            // Hud
            if (!this?._bottomHUD) {
                this._bottomHUD = new BottomHUD(this);
                this.map.addControl(this._bottomHUD);
            }

            // Add
            this.hud.show();
            switch (this.content.type) {
                default:
                    return VSCode.emitToggleEditor("file not recognized as a cultist simulator file");
                case ContentType.Unspecified:
                    this.hud.hide();
                    if (this.widgets.length > 0) return;
                    return this.addWidget(new SelectContentTypeWidget(this));
                case ContentType.Synopsis:
                    this.hud.hide();
                    if (this.widgets.length > 0) return;
                    return this.addWidget(new SynopsisWidget(this, this.content.synopsis));
                case ContentType.Verbs:
                    return this.content.verbs.forEach((verb: Verb) => {
                        if (this.widgets.some((widget: VerbWidget) => widget instanceof VerbWidget && widget.data.id == verb.id)) {
                            return;
                        }
                        this.addWidget(new VerbWidget(this, verb));
                    });
                case ContentType.Elements:
                case ContentType.Recipes:
                case ContentType.Decks:
                case ContentType.Legacies:
                case ContentType.Endings:
            }
        } catch (e) {
            VSCode.emitError(e);
        }
    }

    public removeWidget(widget: Widget<Entity<any>, IWidgetState>, deleteFromContent = false) {
        this._widgets = this.widgets.filter((swidget: Widget<Entity<any>, IWidgetState>) => {
            if (swidget !== widget) return true;
            this.map.removeLayer(widget);
            return false;
        });
        if (deleteFromContent) {
            this.content.remove(widget.data);
            this.save();
        }
    }

    public addWidget(widget: any) {
        this.widgets.push(widget);
        this.map.addLayer(widget);
    }

    public save() {
        return VSCode.save(this.content);
    }
}