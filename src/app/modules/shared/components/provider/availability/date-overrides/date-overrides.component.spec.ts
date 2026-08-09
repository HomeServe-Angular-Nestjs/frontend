import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProviderAvailabilityDateOverridesComponent } from './date-overrides.component';
import { AvailabilityService } from '../../../../../../core/services/availability.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { IDateOverrideViewList } from '../../../../../../core/models/availability.model';

const existingOverride: IDateOverrideViewList = {
  date: '2026-08-15T00:00:00.000Z',
  timeRanges: [],
  reason: 'Clinic holiday',
  isAvailable: false,
};

describe('Provider Date Overrides — scenario tests (S14–S23)', () => {
  let component: ProviderAvailabilityDateOverridesComponent;
  let fixture: ComponentFixture<ProviderAvailabilityDateOverridesComponent>;
  let toastr: jasmine.SpyObj<ToastNotificationService>;

  const availabilityServiceMock = {
    getDateOverrides: jasmine.createSpy('getDateOverrides').and.returnValue(
      of({ data: [existingOverride] })
    ),
    createDateOverride: jasmine.createSpy('createDateOverride').and.returnValue(
      of({ data: { date: '2026-08-20T00:00:00.000Z', timeRanges: [], reason: 'x', isAvailable: true } })
    ),
    deleteOverride: jasmine.createSpy('deleteOverride').and.returnValue(
      of({ success: true })
    ),
  };

  beforeEach(async () => {
    toastr = jasmine.createSpyObj('ToastNotificationService', ['success', 'error', 'info', 'warning', 'custom']);

    await TestBed.configureTestingModule({
      imports: [ProviderAvailabilityDateOverridesComponent],
      providers: [
        { provide: AvailabilityService, useValue: availabilityServiceMock },
        { provide: ToastNotificationService, useValue: toastr },
      ],
    }).compileComponents();

    availabilityServiceMock.getDateOverrides.calls.reset();
    availabilityServiceMock.createDateOverride.calls.reset();
    availabilityServiceMock.deleteOverride.calls.reset();

    fixture = TestBed.createComponent(ProviderAvailabilityDateOverridesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // S14 — Duplicate override date rejected
  describe('S14 — duplicate override date', () => {
    it('flags the date and disables saving', () => {
      component.form.get('date')?.setValue('2026-08-15');

      expect(component.dateError).toBe('This date already has an override');
      expect(component.saveDisabled).toBeTrue();

      component.saveChanges();

      expect(availabilityServiceMock.createDateOverride).not.toHaveBeenCalled();
      expect(toastr.error).toHaveBeenCalledWith('This date already has an override');
    });
  });

  // S15 — Past dates are now BLOCKED
  describe('S15 — past date', () => {
    it('is rejected: save disabled, toast shown, API not called', () => {
      component.selectAvailability('custom');
      component.form.get('date')?.setValue('2020-01-01');
      fixture.detectChanges();

      expect(component.dateError).toBe('Past dates cannot be scheduled');
      expect(component.saveDisabled).toBeTrue();

      component.saveChanges();

      expect(availabilityServiceMock.createDateOverride).not.toHaveBeenCalled();
      expect(toastr.error).toHaveBeenCalledWith('Past dates cannot be scheduled');
    });
  });

  // S16 — Today IS allowed client-side (booking engine still guards past-time-of-day)
  describe('S16 — today', () => {
    it('is accepted when slots exist (no past-date guard)', () => {
      component.selectAvailability('unavailable');
      component.form.get('date')?.setValue(new Date().toISOString().split('T')[0]);

      expect(component.dateError).toBe('');
      expect(component.saveDisabled).toBeFalse();
    });
  });

  // S17 — Invalid date string (unreachable via <input type=date>; payload would be garbled)
  describe('S17 — invalid date value', () => {
    it('reports the raw Date#toString in the payload (gap: no pre-format validation)', () => {
      component.selectAvailability('unavailable');
      // Garbage value can only arrive via devtools; show what happens
      component.form.get('date')?.setValue('not-a-date');
      component.form.get('reason')?.setValue('aaaaaaaaaa');

      component.saveChanges();

      expect(availabilityServiceMock.createDateOverride).toHaveBeenCalledTimes(1);
      const payload = availabilityServiceMock.createDateOverride.calls.mostRecent().args[0];
      expect(payload.date).toBe('not-a-dateT00:00:00.000Z');
    });
  });

  // ---------------------------------------------------------------------------
  // S18 — switching modes clears slots (no restore)
  // ---------------------------------------------------------------------------
  describe('S18 — mode switch clears custom slots', () => {
    it('loses the drafted custom slots when switching unavailable -> custom', () => {
      component.selectAvailability('custom');
      (component.slotDraftForm.get('from'))!.setValue('10:00');
      (component.slotDraftForm.get('to'))!.setValue('11:00');
      component.addDraftSlot();
      expect(component.timeRanges.length).toBe(1);

      component.selectAvailability('unavailable');
      expect(component.timeRanges.length).toBe(0);

      component.selectAvailability('custom');
      expect(component.timeRanges.length).toBe(0);
      expect(component.slotsRequiredError).toBe('At least one time slot is required');
      expect(component.saveDisabled).toBeTrue();
    });
  });

  // S19 — unavailable override sends an empty timeRanges payload
  describe('S19 — all-day unavailable override payload', () => {
    it('submits timeRanges: [] and isAvailable: false', () => {
      component.selectAvailability('unavailable');
      component.form.get('date')?.setValue('2026-08-20');
      component.form.get('reason')?.setValue('Full day closed');
      component.saveChanges();

      const payload = availabilityServiceMock.createDateOverride.calls.mostRecent().args[0];
      expect(payload.timeRanges).toEqual([]);
      expect(payload.isAvailable).toBeFalse();
      expect(payload.date).toBe('2026-08-20T00:00:00.000Z');
    });
  });

  // ---------------------------------------------------------------------------
  // S20 — overlap between two override slots
  // ---------------------------------------------------------------------------
  describe('S20 — overlapping override slots', () => {
    it('blocks a second slot that overlaps the first', () => {
      (component.slotDraftForm.get('from'))!.setValue('10:00');
      (component.slotDraftForm.get('to'))!.setValue('11:00');
      component.addDraftSlot();

      (component.slotDraftForm.get('from'))!.setValue('10:30');
      (component.slotDraftForm.get('to'))!.setValue('11:30');

      expect(component.slotDraftError).toBe('This time slot overlaps an existing slot');
      expect(component.addSlotDisabled).toBeTrue();

      component.addDraftSlot();

      expect(component.timeRanges.length).toBe(1);
      expect(toastr.error).toHaveBeenCalledWith('This time slot overlaps an existing slot');
    });
  });

  // ---------------------------------------------------------------------------
  // S21 — empty custom slots block save
  // ---------------------------------------------------------------------------
  describe('S21 — empty custom slots', () => {
    it('disables save and toasts slotsRequiredError', () => {
      component.selectAvailability('custom');
      component.form.get('date')?.setValue('2026-08-20');
      component.saveChanges();

      expect(component.slotsRequiredError).toBe('At least one time slot is required');
      expect(availabilityServiceMock.createDateOverride).not.toHaveBeenCalled();
      expect(toastr.error).toHaveBeenCalledWith('At least one time slot is required');
      expect(component.saveDisabled).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // S22 — no edit affordance exists for overrides (finding: update is not possible)
  // ---------------------------------------------------------------------------
  describe('S22 — editing an override', () => {
    it('is not supported: the component exposes no update/edit API', () => {
      expect(component.addDraftSlot).toBeDefined();
      // No updateOverride / editOverride method exists in the component API.
      expect((component as any).updateOverride).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // S23 — delete an override
  // ---------------------------------------------------------------------------
  describe('S23 — deleting an override', () => {
    it('removes exactly the matching override and toasts success', () => {
      expect(component.overrides().length).toBe(1);

      component.deleteOverride('2026-08-15');

      expect(availabilityServiceMock.deleteOverride).toHaveBeenCalledWith('2026-08-15T00:00:00.000Z');
      expect(component.overrides().length).toBe(0);
      expect(toastr.success).toHaveBeenCalledWith('Override deleted successfully');
    });

    it('normalizes a full ISO server date without double-appending the time', () => {
      component.overrides.set([
        { date: '2026-08-16T18:30:00.000Z', timeRanges: [], reason: 'X', isAvailable: false },
      ]);

      component.deleteOverride('2026-08-16T18:30:00.000Z');

      expect(availabilityServiceMock.deleteOverride).toHaveBeenCalledWith('2026-08-16T18:30:00.000Z');
      expect(component.overrides().length).toBe(0);
      expect(toastr.success).toHaveBeenCalledWith('Override deleted successfully');
    });

    it('guards an unparseable date without calling the API', () => {
      const before = component.overrides().length;

      component.deleteOverride('not-a-valid-date');

      expect(availabilityServiceMock.deleteOverride).not.toHaveBeenCalled();
      expect(toastr.error).toHaveBeenCalledWith('Invalid override date.');
      expect(component.overrides().length).toBe(before);
    });
  });
});
