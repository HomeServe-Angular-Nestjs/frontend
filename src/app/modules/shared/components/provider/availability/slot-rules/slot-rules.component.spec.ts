import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { ProviderAvailabilityComponentSlotRulesComponent } from './slot-rules.component';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { providerActions } from '../../../../../../store/provider/provider.action';

describe('Provider Slot Rules (buffer time) — scenario tests (S28–S31)', () => {
  let component: ProviderAvailabilityComponentSlotRulesComponent;
  let fixture: ComponentFixture<ProviderAvailabilityComponentSlotRulesComponent>;
  let toastr: jasmine.SpyObj<ToastNotificationService>;
  let providerSubject: BehaviorSubject<any>;
  let dispatchSpy: jasmine.Spy;
  let updateBufferTimeSpy: jasmine.Spy;
  let setProviderDataSpy: jasmine.Spy;

  beforeEach(async () => {
    toastr = jasmine.createSpyObj('ToastNotificationService', ['success', 'error', 'info', 'warning', 'custom']);

    providerSubject = new BehaviorSubject<any>({ id: 'p1', bufferTime: 15 });

    dispatchSpy = jasmine.createSpy('dispatch');

    updateBufferTimeSpy = jasmine.createSpy('updateBufferTime').and.callFake(
      (value: number) => of({ data: { id: 'p1', bufferTime: value }, message: 'Buffer updated' })
    );

    setProviderDataSpy = jasmine.createSpy('setProviderData').and.callFake(
      (data: any) => providerSubject.next(data)
    );

    await TestBed.configureTestingModule({
      imports: [ProviderAvailabilityComponentSlotRulesComponent],
      providers: [
        {
          provide: Store,
          useValue: {
            select: jasmine.createSpy('select').and.callFake(() => providerSubject.asObservable()),
            dispatch: dispatchSpy,
          },
        },
        { provide: Actions, useValue: of() },
        {
          provide: ProviderService,
          useValue: {
            updateBufferTime: updateBufferTimeSpy,
            setProviderData: setProviderDataSpy,
          },
        },
        { provide: ToastNotificationService, useValue: toastr },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderAvailabilityComponentSlotRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.flushEffects();
  });

  it('reads the provider from the store, finishes loading, and stays in sync with it', () => {
    expect(component.isLoading()).toBeFalse();
    expect(component.provider()?.id).toBe('p1');
    expect(component.bufferTime()).toBe(15);

    providerSubject.next({ id: 'p1', bufferTime: 45 });
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(component.bufferTime()).toBe(45);
    expect(component.isDirty()).toBeFalse();
  });

  // S28 — applying a step marks dirty, save persists and returns to clean
  describe('S28 — set buffer time via stepper and save', () => {
    it('dirty when changed; onSubmit calls updateBufferTime and ends clean', () => {
      expect(component.bufferTime()).toBe(15);
      expect(component.isDirty()).toBeFalse();

      component.applyStep(+5);
      expect(component.bufferTime()).toBe(20);
      expect(component.isDirty()).toBeTrue();

      component.onSubmit();
      expect(updateBufferTimeSpy).toHaveBeenCalledWith(20);

      fixture.detectChanges();
      expect(component.isSaving()).toBeFalse();
      expect(component.bufferTime()).toBe(20);
      expect(component.isDirty()).toBeFalse();
      expect(toastr.success).toHaveBeenCalledWith('Buffer updated');
    });

    it('syncs the store after a successful save', () => {
      component.applyStep(+5);
      component.onSubmit();
      fixture.detectChanges();
      expect(dispatchSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: providerActions.successAction.type })
      );
    });
  });

  // S29 — example "until 11:15" uses the current buffer
  describe('S29 — example timeline', () => {
    it('shows 11:15 for a 15-minute buffer (example 10:00 + 60m service + 15m buffer)', () => {
      expect(component.exampleUnavailableUntil()).toBe('11:15');
    });

    it('shows 11:00 when the buffer is zero', () => {
      component.bufferTime.set(0);
      expect(component.exampleUnavailableUntil()).toBe('11:00');
    });
  });

  // S30 — comparing against the server value (dirty sync + revert)
  describe('S30 — dirty state synchronisation with server value', () => {
    it('is clean again once the local value matches the original', () => {
      component.applyStep(-5);
      expect(component.bufferTime()).toBe(10);
      expect(component.isDirty()).toBeTrue();

      component.applyStep(+5);
      expect(component.bufferTime()).toBe(15);
      expect(component.isDirty()).toBeFalse();
    });
  });

  // S31 — clamps negatives and to the 24h cap, rejects invalid/oversize saves
  describe('S31 — buffer bounds', () => {
    it('clamps to 0 from below via the stepper', () => {
      component.bufferTime.set(5);
      component.applyStep(-1_000_000);
      expect(component.bufferTime()).toBe(0);
      expect(component.canDecrement()).toBeFalse();
    });

    it('clamps to the 24h cap (1440) from above via the stepper', () => {
      component.bufferTime.set(0);
      component.applyStep(1_000_000);
      expect(component.bufferTime()).toBe(1440);
    });

    it('clamps an oversize typed value (e.g. 11111111111111) to the cap', () => {
      component.updateBuffer(11111111111111);
      expect(component.bufferTime()).toBe(1440);
    });

    it('rejects state that cannot be a valid number before saving', () => {
      component.bufferTime.set(-1);
      component.onSubmit();
      expect(toastr.error).toHaveBeenCalledWith('Buffer time must be a positive number.');
      expect(updateBufferTimeSpy).not.toHaveBeenCalled();
    });

    it('rejects a value above the cap at submit', () => {
      component.bufferTime.set(1441);
      component.onSubmit();
      expect(toastr.error).toHaveBeenCalledWith('Buffer time cannot exceed 1440 minutes.');
      expect(updateBufferTimeSpy).not.toHaveBeenCalled();
    });
  });

  describe('decrement button enablement', () => {
    it('is disabled at zero and enabled once the buffer is above zero', () => {
      const button = fixture.debugElement.query(
        (de) => de.attributes['aria-label'] === 'Decrease buffer'
      );

      expect(component.bufferTime()).toBe(15);
      expect(button.properties['disabled']).toBe(false);

      component.bufferTime.set(0);
      fixture.detectChanges();
      expect(button.properties['disabled']).toBe(true);
    });
  });

  describe('buffer input clamping', () => {
    it('rewrites the input to the clamped cap after an oversize entry', () => {
      const input = fixture.debugElement.query(
        (de) => de.attributes['aria-label'] === 'Buffer duration in minutes'
      ).nativeElement as HTMLInputElement;

      input.value = '11111111111111';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.bufferTime()).toBe(1440);
      expect(input.value).toBe('1440');
    });

    it('shows a max-limit hint after an oversize entry and clears it on correction', () => {
      const input = fixture.debugElement.query(
        (de) => de.attributes['aria-label'] === 'Buffer duration in minutes'
      ).nativeElement as HTMLInputElement;

      input.value = '99999999999999';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.limitReached()).toBeTrue();
      expect(fixture.nativeElement.textContent).toContain('Maximum buffer time is 1440 minutes');

      input.value = '30';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.limitReached()).toBeFalse();
      expect(fixture.nativeElement.textContent).not.toContain('Maximum buffer time is');
    });
  });
});