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
		clientsViaRefreshTokens: r.many.clients({
			from: r.users.userId.through(r.refreshTokens.userId),
			to: r.clients.clientId.through(r.refreshTokens.clientId),
			alias: "users_userId_clients_clientId_via_refreshTokens"
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
		usersViaRefreshTokens: r.many.users({
			alias: "users_userId_clients_clientId_via_refreshTokens"
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