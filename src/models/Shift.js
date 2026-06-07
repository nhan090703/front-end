// src/models/Shift.js
export class Shift {
  /**
   * nptnhan (5/6/2026) hàm constructor
   */
  constructor(data = {}) {
    this.shiftId = data.shiftId || data.ShiftId || data.shift_id || data.id || null
    this.shiftCode = data.shiftCode || data.ShiftCode || data.shift_code || ''
    this.shiftName = data.shiftName || data.ShiftName || data.shift_name || ''

    this.beginShiftTime = data.beginShiftTime || data.BeginShiftTime || data.begin_shift_time || null
    this.endShiftTime = data.endShiftTime || data.EndShiftTime || data.end_shift_time || null

    this.beginBreakTime = data.beginBreakTime || data.BeginBreakTime || data.begin_break_time || null
    this.endBreakTime = data.endBreakTime || data.EndBreakTime || data.end_break_time || null

    this.workingTime = data.workingTime ?? data.WorkingTime ?? data.working_time ?? null
    this.breakingTime = data.breakingTime ?? data.BreakingTime ?? data.breaking_time ?? null

    this.inActive = data.inActive ?? data.InActive ?? data.in_active ?? false

    this.createdBy = data.createdBy || data.CreatedBy || data.created_by || null
    this.createdDate = data.createdDate || data.CreatedDate || data.created_date || null

    this.modifiedBy = data.modifiedBy || data.ModifiedBy || data.modified_by || null
    this.modifiedDate = data.modifiedDate || data.ModifiedDate || data.modified_date || null

    this.shiftDescription = data.shiftDescription || data.ShiftDescription || data.shift_description || ''
  }
}
