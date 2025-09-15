import { inject, Injectable } from "@angular/core";
import { BaseSocketService } from "./base-socket.service";
import { BehaviorSubject, lastValueFrom, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { authActions } from "../../../store/auth/auth.actions";
import { Store } from "@ngrx/store";
import { API_ENV } from "../../../../environments/env";
import { IReservation, IReservedSlot, ISendReservation } from "../../models/reservation.model";

@Injectable({ providedIn: 'root' })
export class ReservationSocketService extends BaseSocketService {
    private readonly _http = inject(HttpClient);
    private readonly _store = inject(Store);

    protected override namespace = 'reservation';

    private readonly NEW_RESERVATION = 'reservation:new'
    private readonly CHECK_RESERVATION = 'reservation:check';
    private readonly CREATE_RESERVATION = 'reservation:create';
    private readonly IS_RESERVED = 'reservation:reserved';
    private readonly INFORM_RESERVATION = 'reservation:inform';
    private readonly JOIN_PROVIDER_ROOM = 'provider_room:join';
    private readonly LEAVE_PROVIDER_ROOM = 'provider_room:leave';
    private readonly reservationApi = API_ENV.reservation;

    private _initiatePaymentSource = new BehaviorSubject<boolean>(false);

    private _informReservationSource = new BehaviorSubject<{ from: string, to: string, date: string } | null>(null);
    informReservation$ = this._informReservationSource.asObservable();

    get canInitiatePayment(): boolean {
        return this._initiatePaymentSource.getValue();
    }

    set canInitiatePayment(value: boolean) {
        this._initiatePaymentSource.next(value);
    }

    constructor() {
        super();
    }

    protected override onConnect(): void {
        console.log('[ReservationSocketService] Connected');
        this._setupAuthErrorHandler();
        this._onIsReserved(() => this._initiatePaymentSource.next(false));
        this._onNotReserved(() => this._initiatePaymentSource.next(true));
        this._onInformReservation((slot: any) => this._informReservationSource.next(slot));
    }

    protected override onDisconnect(reason: string): void {

    }

    private _setupAuthErrorHandler(): void {
        this.socket?.on('token:expired', async () => {
            console.warn('[ReservationSocket] Server token:expired event received');
            await this._refreshTokensAndReconnect();
        });
    }

    private async _refreshTokensAndReconnect(): Promise<void> {
        try {
            await lastValueFrom(this._refreshAccessToken());
            console.log('[ReservationSocket] Token refreshed successfully. Reconnecting socket...');
            this.socket?.connect();
        } catch (error) {
            console.error('[ReservationSocket] Token refresh failed:', error);
            this.socket?.disconnect();
            this._store.dispatch(authActions.logout({ fromInterceptor: false, message: `${error}` }));
        }
    }

    private _onIsReserved(callback: () => void) {
        this.listen(this.IS_RESERVED, () => callback());
    }

    private _onNotReserved(callback: (slot: any) => void): void {
        this.listen(this.NEW_RESERVATION, (slot: any) => callback(slot));
    }

    private _onInformReservation(callback: (slot: any) => void) {
        this.listen(this.INFORM_RESERVATION, (slot: any) => callback(slot));
    }

    private _refreshAccessToken(): Observable<void> {
        return this._http.post<void>(`${this.reservationApi}/new_access_token`, {}, { withCredentials: true });
    }

    checkReservationUpdates(slot: ISendReservation) {
        this.emit<ISendReservation>(this.CHECK_RESERVATION, slot);
    }

    createReservation(slot: ISendReservation) {
        this._initiatePaymentSource.next(true);
        this.emit<ISendReservation>(this.CREATE_RESERVATION, slot);
    }

    onJoinProviderRoom(providerId: string) {
        this.emit<string>(this.JOIN_PROVIDER_ROOM, providerId);
    }

    onLeaveProviderRoom(providerId: string) {
        this.emit<string>(this.LEAVE_PROVIDER_ROOM, providerId)
    }

    stopListeningReservationUpdates(): void {
        this.removeListener(this.NEW_RESERVATION);
    }
}