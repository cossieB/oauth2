import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	sessions: {
		user: r.one.users({
			from: r.sessions.userId,
			to: r.users.userId
		}),
	},
	users: {
		sessions: r.many.sessions(),
		clientsUserId: r.many.clients({
			alias: "clients_userId_users_userId"
		}),
		clientsViaUserConsent: r.many.clients({
			alias: "clients_clientId_users_userId_via_userConsent"
		}),
	},
	clients: {
		owner: r.one.users({
			from: r.clients.userId,
			to: r.users.userId,
			alias: "clients_userId_users_userId",
			optional: false
		}),
		usersViaUserConsent: r.many.users({
			from: r.clients.clientId.through(r.userConsent.clientId),
			to: r.users.userId.through(r.userConsent.userId),
			alias: "clients_clientId_users_userId_via_userConsent"
		}),
	},
	userConsent: {
		user: r.one.users({
			from: r.userConsent.userId,
			to: r.users.userId
		}),
		client: r.one.clients({
			from: r.userConsent.clientId,
			to: r.clients.clientId
		})
	}
}))