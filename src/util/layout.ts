import { IWidgetState, Widget } from "../view/board_editor/widget/widget";

export enum LayoutAlignment {
    CENTER = 1,
    TOP_LEFT = 2
}

export class Arrange {
    public static Grid(widgets: Widget<any, IWidgetState>[], bounds: L.LatLngBounds, align = LayoutAlignment.CENTER, margin = 60) {
        if (widgets.length == 0) return;

        const defaultWidgetSize = widgets[0].size;
        const center = bounds.getCenter().xy;
        const topLeft = bounds.getNorthWest().xy;
        const bottomLeft = bounds.getSouthWest().xy;
        const topRight = bounds.getNorthEast().xy;
        const width = topRight[0] - bottomLeft[0];
        const height = topRight[1] - bottomLeft[1];

        let columns = Math.floor(width / (defaultWidgetSize[0] + margin));
        const rows = Math.ceil(widgets.length / columns);
        while ((columns - 1) * rows >= widgets.length) columns--;

        let origin = [];
        switch (align) {
            case LayoutAlignment.CENTER:
                origin = [
                    center[0] - (((defaultWidgetSize[0] + margin) * columns) / 2) + ((defaultWidgetSize[0] + margin) / 2),
                    center[1] + (((defaultWidgetSize[1] + margin) * rows) / 2) - ((defaultWidgetSize[1] + margin) / 2)
                ];
                break;
            case LayoutAlignment.TOP_LEFT:
                origin = [
                    topLeft[0] + (defaultWidgetSize[0] / 2) + margin,
                    topLeft[1] - (defaultWidgetSize[1] / 2) - margin
                ];
                break;
            default:
                throw new Error("Unknown layout alignment");
        }

        for (let xIndex = 0, index = 0; xIndex < columns && index < widgets.length; xIndex++) {
            for (let yIndex = 0; yIndex < rows && index < widgets.length; yIndex++, index++) {
                const widget = widgets[index];
                widget.xy = [
                    origin[0] + (xIndex * (widget.size[0] + margin)),
                    origin[1] - (yIndex * (widget.size[1] + margin)),
                ];
                widget.save(true);
            }
        }
    }
}