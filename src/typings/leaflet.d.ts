import 'leaflet';

declare module 'leaflet' {
    interface LatLng {
        xy: [number, number];
    }
}