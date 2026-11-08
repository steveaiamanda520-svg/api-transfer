CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`prefix` text NOT NULL,
	`plan` text NOT NULL,
	`balance` real NOT NULL,
	`tokens` integer DEFAULT 0 NOT NULL,
	`requests` integer DEFAULT 0 NOT NULL,
	`window` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` text PRIMARY KEY NOT NULL,
	`key_id` text NOT NULL,
	`model` text NOT NULL,
	`tokens` integer NOT NULL,
	`cost` real NOT NULL,
	`status` text NOT NULL,
	`time` integer NOT NULL,
	`latency` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`data` text NOT NULL
);
