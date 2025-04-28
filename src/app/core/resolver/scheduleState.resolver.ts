// import { Injectable } from "@angular/core";
// import { ActivatedRouteSnapshot, MaybeAsync, RedirectCommand, Resolve, Router, RouterStateSnapshot } from "@angular/router";
// import { Actions, ofType } from "@ngrx/effects";
// import { Store } from "@ngrx/store";
// import { Observable, of, switchMap, take } from "rxjs";
// import { selectAllSchedules } from "../../store/schedules/schedule.selector";
// import { scheduleActions } from "../../store/schedules/schedule.action";

// @Injectable({ providedIn: 'root' })
// export class SchedulesResolver implements Resolve<boolean> {
//     constructor(
//         private store: Store,
//         private actions$: Actions,
//         private router: Router
//     ) { }

//     resolve(): Observable<boolean> {
//         this.store.select(selectAllSchedules).pipe(
//             take(1),
//             switchMap(() => {
//                 this.store.dispatch(scheduleActions.fetchSchedules());

//                 return this.actions$.pipe(
//                     ofType(
//                         scheduleActions.fetchSchedulesSuccess,
//                         scheduleActions.fetchSchedulesFailure
//                     ),
//                     take(1),
//                     switchMap(())
//                 )
//             })
//         );
//         // return of(true)
//     }
// }