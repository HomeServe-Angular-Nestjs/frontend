import { HttpClient, HttpContext, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_KEY, OPEN_CAGE_URL } from "../../../../environments/env";
import { map, Observable, switchMap } from "rxjs";
import { USE_CREDENTIALS } from "../../interceptors/auth.interceptor";

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
    getCoordinatesFromText(query: string): Observable<any> {
        const encodedQuery = encodeURIComponent(query);
        const bounds = '8.17,74.86,12.97,77.70'; // Kerala bounding box
        const url = `${this._openCageApi}?q=${encodedQuery}&key=${this._openCageToken}&limit=10&countrycode=in`;

        return this._http.get<any>(url, {
            context: new HttpContext().set(USE_CREDENTIALS, false),
        }).pipe(
            map(res => {
                return res.results.map((result: any) => {
                    return { address: result.formatted, coordinates: result.geometry }
                });
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
}
