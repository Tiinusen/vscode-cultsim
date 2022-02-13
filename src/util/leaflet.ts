import * as L from 'leaflet';
import { LatLng } from 'leaflet';

export const yx = L.latLng;
export function xy(x: number | [number, number], y?: number): L.LatLng {
    if (L.Util.isArray(x)) {
        return yx(x[1], x[0]);
    }
    return yx(y, x as number);
}

Object.defineProperty(LatLng.prototype, "xy", {
    get: function xy() {
        return [this.lng, this.lat];
    }
});