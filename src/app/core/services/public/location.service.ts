import { HttpClient, HttpContext } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_KEY, MAPBOX_GEOCODING_URL, MAPBOX_LOCATION_BOUNDS } from "../../../../environments/env";
import { map, Observable, of, switchMap } from "rxjs";
import { USE_CREDENTIALS } from "../../interceptors/auth.interceptor";

export interface IGeoLocation {
    name: string;
    address: string;
    type: string;
    coordinates: {
        lat: number;
        lng: number
    };
}

interface IMapboxFeature {
    text: string;
    place_name: string;
    center: [number, number];
    place_type: string[];
}

@Injectable()
export class LocationService {
    private readonly _http = inject(HttpClient);

    private readonly _geocodingApi = MAPBOX_GEOCODING_URL;

    private readonly _mapboxToken = API_KEY.mapbox;

    private _getCurrentPosition(): Observable<GeolocationPosition> {
        return new Observable(observer => {
            if (!navigator.geolocation) {
                observer.error('Geolocation not found.');
            }

            navigator.geolocation.getCurrentPosition(
                position => observer.next(position),
                err => observer.error(err)
            );
        });
    }

    // Reverse geocoding via Mapbox
    reverseGeocode(lat: number, lng: number): Observable<IGeoLocation | null> {
        const url = `${this._geocodingApi}/${lng},${lat}.json?access_token=${this._mapboxToken}&limit=1`;
        return this._http.get<any>(url, {
            context: new HttpContext().set(USE_CREDENTIALS, false),
        }).pipe(map(res => this._toLocation(res.features?.[0])));
    }

    getAddressFromCurrentLocation(): Observable<IGeoLocation | null> {
        return this._getCurrentPosition().pipe(
            switchMap((pos: GeolocationPosition) =>
                this.reverseGeocode(pos.coords.latitude, pos.coords.longitude)
            )
        );
    }

    // Forward geocoding via Mapbox
    getCoordinatesFromText(query: string): Observable<IGeoLocation[]> {
        if (!query || query.trim().length < 3) {
            return of([]);
        }

        const encodedQuery = encodeURIComponent(query.trim());
        const url = `${this._geocodingApi}/${encodedQuery}.json?access_token=${this._mapboxToken}&limit=10&country=in&bbox=${MAPBOX_LOCATION_BOUNDS}&types=place,locality,neighborhood,district`;

        return this._http.get<any>(url, { context: new HttpContext().set(USE_CREDENTIALS, false), }).pipe(
            map(res =>
                this._dedupe(
                    (res.features ?? [])
                        .map((feature: IMapboxFeature) => this._toLocation(feature))
                        .filter((location: IGeoLocation | null): location is IGeoLocation => !!location)
                )
            )
        );
    }

    // Mapbox reverse geocoding (raw response for callers expecting features)
    getAddressFromCoordinates(lng: number, lat: number): Observable<any> {
        const url = `${this._geocodingApi}/${lng},${lat}.json?access_token=${this._mapboxToken}`;
        return this._http.get(url, {
            context: new HttpContext().set(USE_CREDENTIALS, false),
        });
    }

    private _toLocation(feature?: IMapboxFeature): IGeoLocation | null {
        if (!feature) return null;

        const [lng, lat] = feature.center;

        return {
            name: feature.text,
            address: feature.place_name,
            type: feature.place_type?.[0] ?? 'place',
            coordinates: { lat, lng },
        };
    }

    private _dedupe(locations: IGeoLocation[]): IGeoLocation[] {
        const seen = new Map<string, IGeoLocation>();

        locations.forEach(location => {
            const key = location.name.toLowerCase().trim();
            if (!seen.has(key)) {
                seen.set(key, location);
            }
        });

        return Array.from(seen.values());
    }

}
