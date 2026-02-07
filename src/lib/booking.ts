import { DateTime, Interval } from "luxon";
import { getCalendarConfig } from "@/lib/google-calendar";

type Slot = {
	start: string;
	end: string;
	label: string;
};

type BusyInterval = {
	start: string;
	end: string;
};

const OPEN_HOUR = 9;
const CLOSE_HOUR = 18;

export function buildSlots(dateISO: string, durationMinutes: number) {
	const { timezone } = getCalendarConfig();
	const date = DateTime.fromISO(dateISO, { zone: timezone });
	if (!date.isValid) return [];

	const startOfDay = date.set({ hour: OPEN_HOUR, minute: 0, second: 0, millisecond: 0 });
	const endOfDay = date.set({ hour: CLOSE_HOUR, minute: 0, second: 0, millisecond: 0 });

	const slots: Slot[] = [];
	let cursor = startOfDay;

	while (cursor.plus({ minutes: durationMinutes }) <= endOfDay) {
		const end = cursor.plus({ minutes: durationMinutes });
		slots.push({
			start: cursor.toISO(),
			end: end.toISO(),
			label: cursor.toFormat("HH:mm"),
		});
		cursor = cursor.plus({ minutes: durationMinutes });
	}

	return slots;
}

export function excludeBusy(slots: Slot[], busy: BusyInterval[]) {
	if (!busy.length) return slots;

	const busyIntervals = busy
		.map((item) => {
			const start = DateTime.fromISO(item.start);
			const end = DateTime.fromISO(item.end);
			if (!start.isValid || !end.isValid) return null;
			return Interval.fromDateTimes(start, end);
		})
		.filter((interval): interval is Interval => Boolean(interval));

	return slots.filter((slot) => {
		const slotInterval = Interval.fromDateTimes(
			DateTime.fromISO(slot.start),
			DateTime.fromISO(slot.end),
		);
		return !busyIntervals.some((interval) => interval.overlaps(slotInterval));
	});
}

export function buildBusyIntervals(events: Array<{ start?: string | null; end?: string | null }>) {
	return events
		.map((event) => {
			if (!event.start || !event.end) return null;
			return { start: event.start, end: event.end };
		})
		.filter((item): item is BusyInterval => Boolean(item));
}
