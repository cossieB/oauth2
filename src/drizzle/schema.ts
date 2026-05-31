import { sqliteTable, foreignKey, index, unique, sqliteView, text, integer } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const users = sqliteTable("users", {
	userId: text("user_id").primaryKey(),
	username: text().notNull().unique(),
	email: text().notNull().unique(),
	emailVerifiedAt: integer("email_verified_at", { mode: "timestamp_ms" }),
	passwordHash: text("password_hash").notNull(),
	image: text(),
	name: text(),
	surname: text(),
});

export const sessions = sqliteTable("sessions", {
	sessionId: text("session_id").primaryKey(),
	userId: text("user_id").notNull().references(() => users.userId),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
	lastActivity: integer("last_activity", { mode: "timestamp_ms" }).notNull(),
},
	(table) => [
		index("sessions_user_id").on(table.userId),
	]);

export const clients = sqliteTable("clients", {
	clientId: text("client_id").primaryKey(),
	name: text().notNull(),
	/** Application owner */
	userId: text("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
	redirectUri: text("redirect_uri").notNull(),
	logo: text(),
	description: text().notNull().default(""),
	homepage: text(),
	privacyPolicyLink: text("privacy_policy_link"),
	tosLink: text("tos_link")
});

export const keys = sqliteTable("keys", {
	keyId: integer("key_id").primaryKey(),
	privateKey: text("private_key").notNull(),
	publicKey: text("public_key").notNull(),
});

export const userConsent = sqliteTable("user_consent", {
	userId: text("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
	clientId: text("client_id").notNull().references(() => clients.clientId, { onDelete: "cascade" }),
	scopes: text("scopes", { mode: "json" }).$type<string[]>().default(sql`"[]"`).notNull(),
	createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
	modifiedOn: integer("modified_on", { mode: "timestamp_ms" }),
});

export const refreshTokens = sqliteTable("refresh_tokens", {
	tokenId: integer("token_id").primaryKey(),
	token: text().notNull(),
	clientId: text("client_id").notNull().references(() => clients.clientId, { onDelete: "cascade" }),
	userId: integer("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
	scopes: text().notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
	revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
});

export const profile = sqliteView("profile")
	.as(qb => qb.select({
		username: users.name,
		email: users.email,
		surname: users.surname,
		image: users.image
	})
		.from(users))
