import { HttpClient, HttpContext, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_KEY, OPEN_CAGE_LOCATION_TYPE, OPEN_CAGE_URL } from "../../../../environments/env";
import { map, Observable, of, switchMap } from "rxjs";
import { USE_CREDENTIALS } from "../../interceptors/auth.interceptor";

export interface IOpenCageLocation {
    name: string;
    address: string;
    type: string;
    coordinates: {
        lat: number;
        lng: number
    };
}

@Injectable()
export class LocationService {
    private readonly _http = inject(HttpClient);

    private readonly _openCageApi = OPEN_CAGE_URL;

    private readonly _mapboxToken = API_KEY.mapbox;
    private readonly _openCageToken = API_KEY.openCageApi;

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

    private _getAddressFromCoordinates(lat: number, lng: number): Observable<any> {
        const url = `${this._openCageApi}?q=${lat}+${lng}&key=${this._openCageToken}`;
        return this._http.get(url);
    }

    openCageReverseGeoCode(lat: number, lng: number) {
        const url = `${this._openCageApi}?q=${lat}+${lng}&key=${this._openCageToken}`;
        return this._http.get<any>(url, {
            context: new HttpContext().set(USE_CREDENTIALS, false),
        });
    }

    getAddressFromCurrentLocation(): Observable<any> {
        return this._getCurrentPosition().pipe(
            switchMap((pos: GeolocationPosition) =>
                this._getAddressFromCoordinates(pos.coords.latitude, pos.coords.longitude)
            )
        );
    }

    // Forward geocoding
    getCoordinatesFromText(query: string): Observable<IOpenCageLocation[]> {
        if (!query || query.trim().length < 3) {
            return of([]);
        }

        const q = query.trim().toLowerCase();
        const encodedQuery = encodeURIComponent(query);
        const url = `${this._openCageApi}?q=${encodedQuery}&key=${this._openCageToken}&limit=10&countrycode=in&no_annotations=1`;

        const TYPE_PRIORITY: Record<string, number> = {
            city: 1,
            town: 2,
            municipality: 3,
            suburb: 4,
            village: 5,
            county: 6,
            state_district: 7,
        };

        const NAME_FIELDS = [
            'city',
            'town',
            'municipality',
            'village',
            'suburb',
            'neighbourhood',
            'locality',
            'county',
            'state_district',
        ] as const;

        return this._http.get<any>(url, { context: new HttpContext().set(USE_CREDENTIALS, false), }).pipe(
            map(res => {
                const seen = new Map<string, IOpenCageLocation>();

                res.results
                    .filter((r: any) => OPEN_CAGE_LOCATION_TYPE.includes(r.components?._type))
                    .filter((r: any) => {
                        const c = r.components;

                        const primaryFields = [
                            c?.city,
                            c?.town,
                            c?.municipality,
                            c?.village,
                        ];

                        const secondaryFields = [
                            c?.suburb,
                            c?.neighbourhood,
                            c?.locality,
                            c?.county,
                            c?.state_district,
                            r.formatted,
                        ];

                        // strict for primary
                        if (
                            primaryFields.some(
                                v => typeof v === 'string' && v.toLowerCase().startsWith(q)
                            )
                        ) {
                            return true;
                        }

                        // relaxed for secondary
                        return secondaryFields.some(
                            v => typeof v === 'string' && v.toLowerCase().includes(q)
                        );
                    })
                    .map((r: any) => {
                        const c = r.components;

                        const name =
                            NAME_FIELDS
                                .map(f => c?.[f])
                                .find(
                                    v =>
                                        typeof v === 'string' &&
                                        v.toLowerCase().includes(q)
                                ) ?? r.formatted;

                        const location: IOpenCageLocation = {
                            name,
                            address: r.formatted,
                            coordinates: r.geometry,
                            type: c?._type,
                        };

                        // dedupe by normalized name
                        const key = name.toLowerCase().trim();
                        const existing = seen.get(key);

                        if (!existing) {
                            seen.set(key, location);
                            return;
                        }

                        // keep the better semantic type
                        const existingRank = TYPE_PRIORITY[existing.type] ?? 99;
                        const newRank = TYPE_PRIORITY[location.type] ?? 99;

                        if (newRank < existingRank) {
                            seen.set(key, location);
                        }
                    });

                return Array.from(seen.values());
            })
        );
    }

    // Mapbox reverse geocoding
    getAddressFromCoordinates(lng: number, lat: number): Observable<any> {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this._mapboxToken}`;
        return this._http.get(url, {
            context: new HttpContext().set(USE_CREDENTIALS, false),
        });
    }

    private _buildLocationKey(location: { coordinates: { lat: number; lng: number }; name: string; }) {
        const lat = location.coordinates.lat.toFixed(4);
        const lng = location.coordinates.lng.toFixed(4);
        const name = location.name.toLowerCase().trim();

        return `${lat}:${lng}:${name}`;
    }

}
