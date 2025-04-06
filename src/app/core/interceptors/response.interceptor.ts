import { HttpInterceptorFn, HttpResponse } from "@angular/common/http";
import { catchError, map, throwError } from "rxjs";
import { ResponseInterface } from "../../modules/shared/models/response.model";

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
    const startTime = Date.now();

    return next(req).pipe(
        map((event) => {
            if (event instanceof HttpResponse) {
                if (hasValidResponseContract(event.body)) {
                    return event.clone({ body: event.body });
                }

                const standardizedBody: ResponseInterface = {
                    success: true,
                    message: "Request Successful",
                    data: event.body,
                    error: null,
                    meta: {
                        timestamp: new Date().toISOString(),
                        duration: Date.now() - startTime
                    }
                };

                return event.clone({ body: standardizedBody })
            }
            return event;
        }),
        catchError((error) => {
            const errorResponse: ResponseInterface = {
                success: false,
                message: error.message || "An Error Occurred.",
                data: undefined,
                error: error.error,
                meta: {
                    timestamp: new Date().toISOString(),
                    duration: Date.now() - startTime
                }
            }
            return throwError(() => errorResponse);
        })
    );
};

function hasValidResponseContract(body: any): body is ResponseInterface {
    return body &&
        typeof body.success === 'boolean' &&
        typeof body.message === 'string';
}