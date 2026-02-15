type CalendarConfig = {
	enabled: boolean;
	calendarId: string;
	timezone: string;
	defaultDuration: number;
	inviteClient: boolean;
	sendUpdates: "all" | "externalOnly" | "none";
};

export function getCalendarConfig(): CalendarConfig {
	return {
		enabled: false,
		calendarId: "",
		timezone: "Europe/Rome",
		defaultDuration: 60,
		inviteClient: false,
		sendUpdates: "none",
	};
}

export async function getCalendarClient() {
	throw new Error("Google Calendar disattivato");
}
