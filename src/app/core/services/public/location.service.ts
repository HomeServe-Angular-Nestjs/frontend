import { HttpClient, HttpContext } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_KEY } from "../../../environments/env";
import { Observable } from "rxjs";
import { USE_CREDENTIALS } from "../../interceptors/auth.interceptor";

@Injectable()
export class MapboxLocationService {
    private readonly _http = inject(HttpClient);

    private readonly _mapboxToken = API_KEY.mapbox;

    getAddressFromCoordinates(lng: number, lat: number): Observable<any> {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this._mapboxToken}`;
        return this._http.get(url, {
            context: new HttpContext().set(USE_CREDENTIALS, false),
        });
    }
}