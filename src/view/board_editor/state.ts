import { IWidgetState } from "./widget/widget";

export interface BoardState {
    document: string
    widgetState: Map<string, IWidgetState>
    camera: [number, number]
}