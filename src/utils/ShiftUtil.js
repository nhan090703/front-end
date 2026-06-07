/**
 * nptnhan (5/6/2026) hàm parse time to minutes
 */
function parseTimeToMinutes(time) {
  if (time == null) return null
  const s = String(time).trim()
  if (!s) return null
  // Accept formats: HH:mm or HH:mm:ss — ignore seconds
  const parts = s.split(':').map((p) => p.trim())
  if (parts.length < 2) return null
  const hh = parseInt(parts[0], 10)
  const mm = parseInt(parts[1], 10) || 0
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null
  return hh * 60 + mm
}

/**
 * nptnhan (5/6/2026) hàm compute duration minutes
 */
function computeDurationMinutes(start, end) {
  const s = parseTimeToMinutes(start)
  const e = parseTimeToMinutes(end)
  if (s == null || e == null) return 0
  // if end <= start assume next day
  if (e <= s) return e + 24 * 60 - s
  return e - s
}

/**
 * nptnhan (5/6/2026) hàm to hours rounded3 from minutes
 */
function toHoursRounded3FromMinutes(minutes) {
  const hrs = minutes / 60
  return Number(hrs.toFixed(3))
}

/**
 * nptnhan (5/6/2026) hàm compute breaking time hours
 */
export function computeBreakingTimeHours(beginBreakTime, endBreakTime) {
  const mins = computeDurationMinutes(beginBreakTime, endBreakTime)
  const hrsNum = toHoursRounded3FromMinutes(mins)
  return formatNumber3(hrsNum)
}

/**
 * nptnhan (5/6/2026) hàm compute working time hours
 */
export function computeWorkingTimeHours(
  beginShiftTime,
  endShiftTime,
  beginBreakTime,
  endBreakTime,
) {
  const totalShiftMins = computeDurationMinutes(beginShiftTime, endShiftTime)
  let breakMins = 0
  if (
    beginBreakTime != null &&
    beginBreakTime !== '' &&
    endBreakTime != null &&
    endBreakTime !== ''
  ) {
    breakMins = computeDurationMinutes(beginBreakTime, endBreakTime)
    if (breakMins > totalShiftMins) breakMins = totalShiftMins
  }
  const workingMins = Math.max(0, totalShiftMins - breakMins)
  const hrsNum = toHoursRounded3FromMinutes(workingMins)
  return formatNumber3(hrsNum)
}

/**
 * nptnhan (5/6/2026) hàm format number3
 */
export function formatNumber3(n) {
  if (n == null || n === '') return ''
  const num = Number(n)
  if (Number.isNaN(num)) return ''
  return num.toFixed(3)
}

export default {
  computeBreakingTimeHours,
  computeWorkingTimeHours,
  formatNumber3,
}
