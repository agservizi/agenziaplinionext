import { google } from "googleapis";

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
		enabled: process.env.GOOGLE_CALENDAR_ENABLED === "true",
		calendarId: process.env.GOOGLE_CALENDAR_CALENDAR_ID || "",
		timezone: process.env.GOOGLE_CALENDAR_TIMEZONE || "Europe/Rome",
		defaultDuration: Number(process.env.GOOGLE_CALENDAR_DEFAULT_DURATION || 60),
		inviteClient: process.env.GOOGLE_CALENDAR_INVITE_CLIENT === "true",
		sendUpdates: (process.env.GOOGLE_CALENDAR_SEND_UPDATES as CalendarConfig["sendUpdates"]) || "none",
	};
}

function decodeCredentials() {
	const encoded = process.env.GOOGLE_CALENDAR_CREDENTIALS_JSON;
	if (!encoded) return null;
	try {
		const json = Buffer.from(encoded, "base64").toString("utf-8");
		return JSON.parse(json);
	} catch (error) {
		console.error("Invalid GOOGLE_CALENDAR_CREDENTIALS_JSON", error);
		return null;
	}
}

export async function getCalendarClient() {
	const credentials = decodeCredentials();
	if (!credentials) {
		throw new Error("Credenziali Google Calendar non valide");
	}

	const auth = new google.auth.GoogleAuth({
		credentials,
		scopes: ["https://www.googleapis.com/auth/calendar"],
	});

	return google.calendar({ version: "v3", auth });
}
