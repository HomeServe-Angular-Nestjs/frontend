import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as mapboxgl from 'mapbox-gl';
import { API_KEY } from '../../../../../../environments/env';

@Component({
  selector: 'app-mapbox-map',
  imports: [CommonModule],
  templateUrl: './map.component.html',
  standalone: true
})
export class MapboxMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() center: [number, number] = [76.9560, 8.5010];
  @Input() zoom: number = 12;
  @Input() search: boolean = false;
  @Input() disableInteraction: boolean = false;

  @Output() locationChanged = new EventEmitter<[number, number]>();

  @ViewChild('mapContainer', { static: true }) mapElementRef!: ElementRef;
  @ViewChild('geocoderContainer', { static: false }) geocoderElementRef!: ElementRef;

  private map!: mapboxgl.Map;
  private marker!: mapboxgl.Marker;
  private accessToken = API_KEY.mapbox;

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

    if (this.disableInteraction) {
      this.map.scrollZoom.disable();
      this.map.boxZoom.disable();
      this.map.dragRotate.disable();
      this.map.dragPan.disable();
      this.map.keyboard.disable();
      this.map.doubleClickZoom.disable();
      this.map.touchZoomRotate.disable();
    }

    this.marker = new mapboxgl.Marker({ draggable: !this.disableInteraction })
      .setLngLat(this.center)
      .addTo(this.map);

    if (!this.disableInteraction) {
      this.marker.on('dragend', () => {
        const lngLat = this.marker.getLngLat();
        this.locationChanged.emit([lngLat.lng, lngLat.lat]);
      });

      this.map.on('click', (event) => {
        const lngLat = event.lngLat;
        this.marker.setLngLat(lngLat);
        this.locationChanged.emit([lngLat.lng, lngLat.lat]);
      });
    }

    if (this.search && this.geocoderElementRef?.nativeElement && !this.disableInteraction) {
      const geocoder = new MapboxGeocoder({
        accessToken: this.accessToken,
        mapboxgl: mapboxgl,
        marker: false
      });

      geocoder.on('result', (event) => {
        const coords = event.result.center as [number, number];
        this.map.flyTo({ center: coords, zoom: this.zoom });
        this.marker.setLngLat(coords);
        this.locationChanged.emit(coords);
      });

      this.map.addControl(geocoder, 'top-left');
    }

    setTimeout(() => this.map.resize(), 100);
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }
}
