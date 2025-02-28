CREATE TABLE IF NOT EXISTS "country" (
	"code" char(2) PRIMARY KEY NOT NULL,
	"name" varchar(35) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discord_user" (
	"discord_user_id" varchar(19) PRIMARY KEY NOT NULL,
	"username" varchar(32) NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "osu_badge" (
	"img_file_name" varchar(60) PRIMARY KEY NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "osu_user" (
	"osu_user_id" integer PRIMARY KEY NOT NULL,
	"username" varchar(16) NOT NULL,
	"is_restricted" boolean NOT NULL,
	"global_std_rank" integer,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"code" char(2) NOT NULL,
	CONSTRAINT "uni_osu_user_username" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "osu_user_awarded_badge" (
	"osu_user_id" integer NOT NULL,
	"osu_badge_img_file_name" varchar(60) NOT NULL,
	"awarded_at" timestamp (3) with time zone NOT NULL,
	CONSTRAINT "osu_user_awarded_badge_osu_user_id_osu_badge_img_file_name_pk" PRIMARY KEY("osu_user_id","osu_badge_img_file_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"registered_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_api_data_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"api_key" varchar(24) NOT NULL,
	"osu_user_id" integer NOT NULL,
	"discord_user_id" varchar(19) NOT NULL,
	CONSTRAINT "uni_user_api_key" UNIQUE("api_key")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "osu_user" ADD CONSTRAINT "osu_user_code_country_code_fk" FOREIGN KEY ("code") REFERENCES "country"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "osu_user_awarded_badge" ADD CONSTRAINT "osu_user_awarded_badge_osu_user_id_osu_user_osu_user_id_fk" FOREIGN KEY ("osu_user_id") REFERENCES "osu_user"("osu_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "osu_user_awarded_badge" ADD CONSTRAINT "osu_user_awarded_badge_osu_badge_img_file_name_osu_badge_img_file_name_fk" FOREIGN KEY ("osu_badge_img_file_name") REFERENCES "osu_badge"("img_file_name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_osu_user_id_osu_user_osu_user_id_fk" FOREIGN KEY ("osu_user_id") REFERENCES "osu_user"("osu_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_discord_user_id_discord_user_discord_user_id_fk" FOREIGN KEY ("discord_user_id") REFERENCES "discord_user"("discord_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
