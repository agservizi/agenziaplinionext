type Slot = {
	start: string;
	end: string;
	label: string;
};

type BusyInterval = {
	start: string;
	end: string;
};

export function buildSlots() {
	return [] as Slot[];
}

export function excludeBusy(slots: Slot[], _busy: BusyInterval[]) {
	return slots;
}

export function buildBusyIntervals() {
	return [] as BusyInterval[];
}
