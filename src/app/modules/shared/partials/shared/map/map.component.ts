// mapbox-map.component.ts
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

@Component({
    selector: 'app-mapbox-map',
    template: `<div #mapContainer id="map" style="width: 100%; height: 400px;"></div>`,
    standalone: true
})
export class MapboxMapComponent implements AfterViewInit, OnDestroy {
    @Input() center: [number, number] = [0, 0];
    @Input() zoom: number = 12;
    @Input() accessToken!: string;

    @Output() locationChanged = new EventEmitter<[number, number]>();

    @ViewChild('mapContainer', { static: true }) mapElementRef!: ElementRef;

    private map!: mapboxgl.Map;
    private marker!: mapboxgl.Marker;

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

        setTimeout(() => this.map.resize(), 100);
    }

    ngOnDestroy(): void {
        if (this.map) this.map.remove();
    }
}
