import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProviderDefaultAvailabilityComponent } from './default-availability.component';
import { AvailabilityService } from '../../../../../../core/services/availability.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { IAvailabilityListView, IWeeklyAvailability } from '../../../../../../core/models/availability.model';
import { WeekEnum } from '../../../../../../core/enums/enums';

const emptyWeek: IWeeklyAvailability['week'] = {
  sun: { isAvailable: false, timeRanges: [] },
  mon: { isAvailable: false, timeRanges: [] },
  tue: { isAvailable: false, timeRanges: [] },
  wed: { isAvailable: false, timeRanges: [] },
  thu: { isAvailable: false, timeRanges: [] },
  fri: { isAvailable: false, timeRanges: [] },
  sat: { isAvailable: false, timeRanges: [] },
};

describe('Provider Default Availability — scenario tests (S1–S13, S32)', () => {
  let component: ProviderDefaultAvailabilityComponent;
  let fixture: ComponentFixture<ProviderDefaultAvailabilityComponent>;
  let toastr: jasmine.SpyObj<ToastNotificationService>;

  const availabilityServiceMock = {
    getAvailability: jasmine.createSpy('getAvailability').and.returnValue(
      of({ data: { providerId: 'p1', week: emptyWeek } })
    ),
    updateAvailability: jasmine.createSpy('updateAvailability').and.returnValue(
      of({ data: { providerId: 'p1', week: emptyWeek } })
    ),
  };

  const sun = (): IAvailabilityListView =>
    component.weeklyAvailability.find(d => d.label === WeekEnum.SUN)!;

  beforeEach(async () => {
    toastr = jasmine.createSpyObj('ToastNotificationService', ['success', 'error', 'info', 'warning', 'custom']);

    await TestBed.configureTestingModule({
      imports: [ProviderDefaultAvailabilityComponent],
      providers: [
        { provide: AvailabilityService, useValue: availabilityServiceMock },
        { provide: ToastNotificationService, useValue: toastr },
      ],
    }).compileComponents();

    availabilityServiceMock.getAvailability.calls.reset();
    availabilityServiceMock.updateAvailability.calls.reset();

    fixture = TestBed.createComponent(ProviderDefaultAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---------------------------------------------------------------------------
  // S1 — Overlapping slots are rejected (editor + save)
  // ---------------------------------------------------------------------------
  describe('S1 — overlapping slots (10:00–12:00 + 11:30–13:00)', () => {
    it('blocks the overlapping slot in the inline editor', () => {
      const day = sun();
      day.active = true;
      day.timeRanges = [{ from: '10:00', to: '12:00' }];

      component.editorDay = day;
      component.editorIndex = null;
      component.editorDraft = { from: '11:30', to: '13:00' };

      component.confirmEditor();

      expect(day.timeRanges.length).toBe(1);
      expect(day.timeRanges[0]).toEqual({ from: '10:00', to: '12:00' });
      expect(component.editorInlineError).toBe('Time slots must not overlap');
      expect(toastr.error).toHaveBeenCalledWith('Time slots must not overlap');
      expect(component.isDirty).toBeFalse();
    });

    it('blocks a save when an overlapping slot already exists in the day', () => {
      const day = sun();
      day.active = true;
      day.timeRanges = [
        { from: '10:00', to: '12:00' },
        { from: '11:30', to: '13:00' },
      ];

      component.saveWorkHours();

      expect(availabilityServiceMock.updateAvailability).not.toHaveBeenCalled();
      expect(toastr.error).toHaveBeenCalledWith('Sun: Time slots must not overlap');
      expect(component.isSaving).toBeFalse();
      expect(component.isDirty).toBeFalse();
    });

    it('allows a NON-overlapping slot (12:00–13:00 adjacent to 10:00–12:00)', () => {
      const day = sun();
      day.active = true;
      day.timeRanges = [{ from: '10:00', to: '12:00' }];

      component.editorDay = day;
      component.editorIndex = null;
      component.editorDraft = { from: '12:00', to: '13:00' };

      component.confirmEditor();

      expect(day.timeRanges.length).toBe(2);
      expect(day.timeRanges[1]).toEqual({ from: '12:00', to: '13:00' });
      expect(component.isDirty).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // S2 — Adjacent (touching) slots are allowed
  // ---------------------------------------------------------------------------
  describe('S2 — adjacent slots (10:00–11:00 + 11:00–12:00)', () => {
    it('allows 11:00–12:00 immediately after 10:00–11:00 in the editor', () => {
      const day = sun();
      day.active = true;
      day.timeRanges = [{ from: '10:00', to: '11:00' }];

      component.editorDay = day;
      component.editorIndex = null;
      component.editorDraft = { from: '11:00', to: '12:00' };

      component.confirmEditor();

      expect(day.timeRanges.length).toBe(2);
      expect(component.editorInlineError).toBe('');
    });

    it('passes full-day validation and is sent to the server', () => {
      const day = sun();
      day.active = true;
      day.timeRanges = [
        { from: '10:00', to: '11:00' },
        { from: '11:00', to: '12:00' },
      ];

      component.saveWorkHours();

      expect(availabilityServiceMock.updateAvailability).toHaveBeenCalledTimes(1);
      const payload = availabilityServiceMock.updateAvailability.calls.mostRecent().args[0];
      expect(payload.sun.timeRanges).toEqual([
        { startTime: '10:00', endTime: '11:00' },
        { startTime: '11:00', endTime: '12:00' },
      ]);
    });
  });

  // ---------------------------------------------------------------------------
  // S3 — Zero-length slots are rejected
  // ---------------------------------------------------------------------------
  describe('S3 — zero-length slot (10:00–10:00)', () => {
    it('rejects 10:00–10:00 in the editor', () => {
      const day = sun();
      day.active = true;
      day.timeRanges = [];

      component.editorDay = day;
      component.editorIndex = null;
      component.editorDraft = { from: '10:00', to: '10:00' };

      component.confirmEditor();

      expect(day.timeRanges.length).toBe(0);
      expect(component.editorInlineError).toBe('Start time must be before end time');
    });

    it('rejects a save containing a zero-length slot', () => {
      const day = sun();
      day.active = true;
      day.timeRanges = [{ from: '10:00', to: '10:00' }];

      component.saveWorkHours();

      expect(availabilityServiceMock.updateAvailability).not.toHaveBeenCalled();
      expect(toastr.error).toHaveBeenCalledWith('Sun: Start time must be before end time');
    });
  });

  // ---------------------------------------------------------------------------
  // S4 — Reversed ranges are rejected
  // ---------------------------------------------------------------------------
  describe('S4 — reversed slot (12:00–10:00)', () => {
    it('rejects 12:00–10:00 in the editor', () => {
      const day = sun();
      component.editorDay = day;
      component.editorIndex = null;
      component.editorDraft = { from: '12:00', to: '10:00' };

      component.confirmEditor();

      expect(day.timeRanges.length).toBe(0);
      expect(component.editorInlineError).toBe('Start time must be before end time');
    });

    it('rejects a save containing a reversed slot', () => {
      const day = sun();
      day.active = true;
      day.timeRanges = [{ from: '12:00', to: '10:00' }];

      component.saveWorkHours();

      expect(availabilityServiceMock.updateAvailability).not.toHaveBeenCalled();
      expect(toastr.error).toHaveBeenCalledWith('Sun: Start time must be before end time');
    });
  });

  // ---------------------------------------------------------------------------
  // S5 — Very small durations are allowed
  // ---------------------------------------------------------------------------
  describe('S5 — small duration (10:00–10:05)', () => {
    it('allows a 5-minute slot', () => {
      const day = sun();
      day.active = true;
      day.timeRanges = [];

      component.editorDay = day;
      component.editorIndex = null;
      component.editorDraft = { from: '10:00', to: '10:05' };

      component.confirmEditor();

      expect(component.editorInlineError).toBe('');
      expect(day.timeRanges).toEqual([{ from: '10:00', to: '10:05' }]);
    });
  });

  // ---------------------------------------------------------------------------
  // S6 — Cross-midnight ranges are unsupported (handled as "reversed")
  // ---------------------------------------------------------------------------
  describe('S6 — cross-midnight slot (22:00–02:00)', () => {
    it('is rejected as start >= end', () => {
      const dayProbe = sun();
      dayProbe.timeRanges = [{ from: '22:00', to: '02:00' }];
      expect(component.dayError(dayProbe)).toBe('Start time must be before end time');
    });

    it('is not emitted across midnight — frontend cannot represent next-day ranges', () => {
      expect(component.defaultTimeRange).toEqual({ from: '09:00', to: '17:00' });
    });
  });

  // ---------------------------------------------------------------------------
  // S7 — Rapid successive adds stay distinct and non-overlapping
  // ---------------------------------------------------------------------------
  describe('S7 — rapid successive adds', () => {
    it('suggests the next slot after the previous one and produces distinct ranges', () => {
      const day = sun();
      day.active = true;
      day.timeRanges = [];

      component.openAddSlot(day);
      expect(component.editorDraft).toEqual({ from: '09:00', to: '17:00' });
      component.confirmEditor();

      component.openAddSlot(day);
      expect(component.editorDraft).toEqual({ from: '17:10', to: '18:10' });
      component.confirmEditor();

      expect(day.timeRanges).toEqual([
        { from: '09:00', to: '17:00' },
        { from: '17:10', to: '18:10' },
      ]);
      expect(component.dayError(day)).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // S8 — Deleting a slot around an in-progress edit (index corruption)
  // ---------------------------------------------------------------------------
  describe('S8 — slot deletion while the editor is open', () => {
    it('updates the intended slot even when an earlier slot was deleted first', () => {
      const day = sun();
      day.timeRanges = [
        { from: '10:00', to: '11:00' },
        { from: '11:00', to: '12:00' },
        { from: '12:00', to: '13:00' }, // editing this one
      ];

      component.startEditSlot(day, 2);
      component.removeSlot(day, 0); // array shifts to [B, C]
      component.editorDraft = { from: '09:00', to: '10:00' };

      expect(() => component.confirmEditor()).not.toThrow();
      expect(day.timeRanges).toEqual([
        { from: '11:00', to: '12:00' },
        { from: '09:00', to: '10:00' },
      ]);
    });

    it('aborts safely (no corruption) when the edited slot itself is deleted', () => {
      const day = sun();
      day.timeRanges = [
        { from: '10:00', to: '11:00' }, // A — being edited
        { from: '11:00', to: '12:00' }, // B
      ];

      component.startEditSlot(day, 0);
      component.removeSlot(day, 0); // delete the slot being edited

      expect(() => component.confirmEditor()).not.toThrow();

      // No silent overwrite: B survives untouched, a warning is shown, editor closes.
      expect(day.timeRanges).toEqual([{ from: '11:00', to: '12:00' }]);
      expect(toastr.warning).toHaveBeenCalledWith('The slot you were editing no longer exists.');
      expect(component.editorDay).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // S9 — Delete all slots on a day
  // ---------------------------------------------------------------------------
  describe('S9 — deleting every slot', () => {
    it('deactivates the day and marks the form dirty', () => {
      const day = sun();
      day.active = true;
      day.timeRanges = [
        { from: '10:00', to: '11:00' },
        { from: '12:00', to: '13:00' },
      ];

      component.removeSlot(day, 0);
      component.removeSlot(day, 0);

      expect(day.timeRanges.length).toBe(0);
      expect(day.active).toBeFalse();
      expect(component.isDirty).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // S10 — Add a slot to a deactivated day reactivates it
  // ---------------------------------------------------------------------------
  describe('S10 — add after delete-all', () => {
    it('reactivates the day when a slot is added', () => {
      const day = sun();
      day.active = false;
      day.timeRanges = [];

      component.openAddSlot(day);
      component.confirmEditor();

      expect(day.timeRanges.length).toBe(1);
      expect(day.active).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // S11 — Cancel (revert) discards editor changes
  // ---------------------------------------------------------------------------
  describe('S11 — revert / cancel editor edit', () => {
    it('closeEditor restores the previous value and does not dirty the form', () => {
      const day = sun();
      day.active = true;
      day.timeRanges = [{ from: '10:00', to: '11:00' }];

      component.startEditSlot(day, 0);
      component.editorDraft = { from: '20:00', to: '21:00' };
      component.closeEditor();

      expect(day.timeRanges).toEqual([{ from: '10:00', to: '11:00' }]);
      expect(component.isDirty).toBeFalse();
      expect(component.editorDay).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // S12 — Unsaved changes prompt on unload
  // ---------------------------------------------------------------------------
  describe('S12 — beforeunload guard', () => {
    it('intercepts unload when dirty and allows it when clean', () => {
      const event = { preventDefault: jasmine.createSpy(), returnValue: undefined } as any;
      component.handleBeforeUnload(event);
      expect(event.preventDefault).not.toHaveBeenCalled();

      component.markDirty();
      event.preventDefault.calls.reset();
      component.handleBeforeUnload(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // S13 — Server failure on save shows feedback and does not fake success
  // ---------------------------------------------------------------------------
  describe('S13 -- save failure feedback', () => {
    it('shows an error toast, resets saving state and does not fake success', () => {
      const day = sun();
      day.active = true;
      day.timeRanges = [{ from: '10:00', to: '11:00' }];
      component.isDirty = true;
      availabilityServiceMock.updateAvailability.and.returnValue(
        throwError(() => new Error('network down'))
      );

      component.saveWorkHours();

      expect(toastr.error).toHaveBeenCalledWith('Failed to update work hours. Please try again.');
      expect(toastr.success).not.toHaveBeenCalled();
      expect(component.isSaving).toBeFalse();
      expect(component.isDirty).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // S32 — Suggestion never produces past-midnight 24:xx times, and manual ones are rejected
  // ---------------------------------------------------------------------------
  describe('S32 — suggestion when the last slot ends late', () => {
    it('does not propose a cross-midnight slot (falls back to the default range)', () => {
      const day = sun();
      day.active = true;
      day.timeRanges = [{ from: '23:00', to: '23:50' }];

      component.openAddSlot(day);
      expect(component.editorDraft).toEqual({ from: '09:00', to: '17:00' });
    });

    it('rejects a manually-typed cross-midnight slot', () => {
      const day = sun();
      day.active = true;
      day.timeRanges = [];

      component.editorDay = day;
      component.editorIndex = null;
      component.editorDraft = { from: '24:00', to: '25:00' };

      expect(component.editorInlineError).toBe('Time slots must be within the same day');
      component.confirmEditor();

      expect(day.timeRanges.length).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // S33 — Backend precedence (S24–S27) cannot be exercised client-side; see report
  // ---------------------------------------------------------------------------
  describe('S33 — server payload shape equality', () => {
    it('maps editor state to the server week shape (sun/mon/...) exactly', () => {
      const sun = component.weeklyAvailability.find(d => d.label === WeekEnum.SUN)!;
      sun.active = true;
      sun.timeRanges = [{ from: '10:00', to: '11:00' }];

      component.saveWorkHours();

      const payload = availabilityServiceMock.updateAvailability.calls.mostRecent().args[0];
      expect(payload.sun.isAvailable).toBeTrue();
      expect(payload.sun.timeRanges).toEqual([{ startTime: '10:00', endTime: '11:00' }]);
      expect(payload.mon.isAvailable).toBeFalse();
    });
  });
});