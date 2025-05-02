import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as mapboxgl from 'mapbox-gl';

@Component({
    selector: 'app-mapbox-map',
    template: `
    <div class="relative">
        <div #geocoderContainer class=" z-50 custom-geocoder w-full"></div>
        <div #mapContainer id="map" style="width: 100%; height: 400px;"></div>
    </div>
    `,
    standalone: true
})
export class MapboxMapComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input() center: [number, number] = [0, 0];
    @Input() zoom: number = 12;
    @Input() accessToken!: string;

    @Output() locationChanged = new EventEmitter<[number, number]>();

    @ViewChild('mapContainer', { static: true }) mapElementRef!: ElementRef;
    @ViewChild('geocoderContainer', { static: true }) geocoderElementRef!: ElementRef;

    private map!: mapboxgl.Map;
    private marker!: mapboxgl.Marker;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['center'] && !changes['center'].firstChange) {
            this.map.setCenter(this.center);
            this.marker.setLngLat(this.center);
        }

        if (changes['zoom'] && !changes['zoom'].firstChange) {
            this.map.setZoom(this.zoom);
        }
    }

    ngAfterViewInit(): void {
        this.map = new mapboxgl.Map({
            container: this.mapElementRef.nativeElement,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: this.center,
            zoom: this.zoom,
            accessToken: this.accessToken
        });

        this.marker = new mapboxgl.Marker({ draggable: true })
            .setLngLat(this.center)
            .addTo(this.map);

        this.marker.on('dragend', () => {
            const lngLat = this.marker.getLngLat();
            this.locationChanged.emit([lngLat.lng, lngLat.lat]);
        });

        this.map.on('click', (event) => {
            const lngLat = event.lngLat;
            this.marker.setLngLat(lngLat);
            this.locationChanged.emit([lngLat.lng, lngLat.lat]);
        });

        const geocoder = new MapboxGeocoder({
            accessToken: this.accessToken,
            mapboxgl: mapboxgl,
            marker: false // We'll handle marker ourselves
        });

        geocoder.on('result', (event) => {
            const coords = event.result.center as [number, number];
            this.map.flyTo({ center: coords, zoom: this.zoom });
            this.marker.setLngLat(coords);
            this.locationChanged.emit(coords);
        });

        this.geocoderElementRef.nativeElement.appendChild(geocoder.onAdd(this.map));

        setTimeout(() => this.map.resize(), 100);
    }

    ngOnDestroy(): void {
        if (this.map) this.map.remove();
    }
}
