-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `users` (
	`user_id` text NOT NULL,
	`username` text NOT NULL UNIQUE,
	`email` text NOT NULL UNIQUE,
	`email_verified_at` integer,
	`password` text NOT NULL,
	`image` text,
	`name` text,
	`surname` text,
	CONSTRAINT `users_pk` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`session_id` text NOT NULL,
	`user_id` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`last_activity` integer NOT NULL,
	CONSTRAINT `sessions_pk` PRIMARY KEY(`session_id`),
	CONSTRAINT `fk_sessions_user_id_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`client_id` text NOT NULL,
	`name` text NOT NULL,
	`user_id` integer NOT NULL,
	`redirect_uri` text NOT NULL,
	`logo` text NOT NULL,
	CONSTRAINT `clients_pk` PRIMARY KEY(`client_id`),
	CONSTRAINT `fk_clients_user_id_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `keys` (
	`key_id` integer,
	`private_key` text NOT NULL,
	`public_key` text NOT NULL,
	CONSTRAINT `keys_pk` PRIMARY KEY(`key_id`)
);
--> statement-breakpoint
CREATE TABLE `user_consent` (
	`user_id` integer NOT NULL,
	`client_id` text NOT NULL,
	`scopes` text DEFAULT "" NOT NULL,
	`created_at` integer NOT NULL,
	`modified_on` integer,
	CONSTRAINT `fk_user_consent_client_id_clients_client_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`client_id`) ON DELETE CASCADE,
	CONSTRAINT `fk_user_consent_user_id_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`token_id` integer,
	`token` text NOT NULL,
	`client_id` text NOT NULL,
	`user_id` integer NOT NULL,
	`scopes` text NOT NULL,
	`expires_at` integer NOT NULL,
	`revoked_at` integer,
	CONSTRAINT `refresh_tokens_pk` PRIMARY KEY(`token_id`),
	CONSTRAINT `fk_refresh_tokens_user_id_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
	CONSTRAINT `fk_refresh_tokens_client_id_clients_client_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`client_id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `sessions_user_id` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE VIEW `profile` AS SELECT username, email, name, surname, image FROM users;
*/