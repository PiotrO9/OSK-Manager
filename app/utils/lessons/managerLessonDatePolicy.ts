import type { DateValue } from '@internationalized/date';
import { getLocalTimeZone } from '@internationalized/date';
import { dateValueToIsoDateString } from '~/utils/date/weeklyCalendarDates';

export function isManagerLessonDateDisabled(
    date: DateValue,
    policy: {
        workingWeekdays?: readonly number[];
        dayOffDates?: readonly string[];
        workingExceptionDates?: readonly string[];
        schoolWorkingDaysMask?: number;
    },
): boolean {
    const iso = dateValueToIsoDateString(date);
    const weekday = date.toDate(getLocalTimeZone()).getDay();

    if (
        policy.schoolWorkingDaysMask !== undefined &&
        (policy.schoolWorkingDaysMask & (1 << weekday)) === 0
    )
        return true;

    if (policy.dayOffDates?.includes(iso)) return true;

    if (policy.workingExceptionDates?.includes(iso)) return false;

    if (!policy.workingWeekdays) return false;

    return !policy.workingWeekdays.includes(weekday);
}
