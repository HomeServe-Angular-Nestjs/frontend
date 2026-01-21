import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { ICustomerSearchCategories, IProfession, IProfessionFilter, IServiceCategory, IServiceCategoryFilter, IServiceCategoryWithPagination } from "../models/category.model";
import { IResponse } from "../../modules/shared/models/response.model";


@Injectable({ providedIn: 'root' })
export class CategoryService {
    private _http = inject(HttpClient);
    private readonly _categoryUrl = API_ENV.category;

    // Subjects
    private _professionsSource = new BehaviorSubject<IProfession[]>([]);
    professions$ = this._professionsSource.asObservable(); // usually for dropdowns or full lists

    private _servicesSource = new BehaviorSubject<IServiceCategory[]>([]);
    services$ = this._servicesSource.asObservable();

    // ----------------------------
    // Profession Methods
    // ----------------------------

    getProfessions(filter: IProfessionFilter = {}, page: number = 1, limit: number = 100): Observable<IResponse<IProfession[]>> {
        let params = new HttpParams()
            .set('page', page)
            .set('limit', limit);

        for (const [key, value] of Object.entries(filter)) {
            if (value) {
                params = params.set(key, value);
            }
        }
        return this._http.get<IResponse<IProfession[]>>(`${this._categoryUrl}/profession`, { params }).pipe(
            tap(res => {
                if (res.data) this._professionsSource.next(res.data);
            })
        );
    }

    createProfession(profession: Partial<IProfession>): Observable<IResponse<IProfession>> {
        return this._http.post<IResponse<IProfession>>(`${this._categoryUrl}/profession`, profession);
    }

    updateProfession(profession: Partial<IProfession>, professionId?: string): Observable<IResponse<IProfession>> {
        return this._http.put<IResponse<IProfession>>(`${this._categoryUrl}/profession/${professionId}`, profession);
    }

    updateProfessionStatus(professionId: string): Observable<IResponse<boolean>> {
        return this._http.patch<IResponse<boolean>>(`${this._categoryUrl}/profession/${professionId}/toggle-status`, {});
    }

    removeProfession(professionId: string): Observable<IResponse<boolean>> {
        return this._http.delete<IResponse<boolean>>(`${this._categoryUrl}/profession/${professionId}`);
    }

    // ----------------------------
    // Service Category Methods
    // ----------------------------

    getServiceCategories(filter: IServiceCategoryFilter = {}, page: number = 1, limit: number = 10): Observable<IResponse<IServiceCategoryWithPagination>> {
        let params = new HttpParams()
            .set('page', page)
            .set('limit', limit);

        for (const [key, value] of Object.entries(filter)) {
            if (value !== undefined && value !== null) {
                params = params.set(key, value);
            }
        }
        return this._http.get<IResponse<IServiceCategoryWithPagination>>(`${this._categoryUrl}/service`, { params }).pipe(
            tap(res => {
                if (res.data) this._servicesSource.next(res.data.services);
            })
        );
    }

    getServiceCategoriesByProfessionId(professionId: string): Observable<IResponse<IServiceCategory[]>> {
        return this._http.get<IResponse<IServiceCategory[]>>(`${this._categoryUrl}/service/${professionId}`);
    }

    createServiceCategory(service: Partial<IServiceCategory>): Observable<IResponse<IServiceCategory>> {
        return this._http.post<IResponse<IServiceCategory>>(`${this._categoryUrl}/service`, service);
    }

    updateServiceCategory(id: string, service: Partial<IServiceCategory>): Observable<IResponse<IServiceCategory>> {
        return this._http.put<IResponse<IServiceCategory>>(`${this._categoryUrl}/service/${id}`, service);
    }

    updateServiceCategoryStatus(id: string): Observable<IResponse<boolean>> {
        return this._http.patch<IResponse<boolean>>(`${this._categoryUrl}/service/${id}/toggle-status`, {});
    }

    removeServiceCategory(id: string): Observable<IResponse<boolean>> {
        return this._http.delete<IResponse<boolean>>(`${this._categoryUrl}/service/${id}`);
    }

    searchCategories(search: string): Observable<IResponse<ICustomerSearchCategories[]>> {
        const params = new HttpParams().set('search', search);
        return this._http.get<IResponse<ICustomerSearchCategories[]>>(`${this._categoryUrl}/search`, { params });
    }
}
