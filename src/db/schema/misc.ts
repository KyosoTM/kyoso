// import {
//   pgTable,
//   serial,
//   varchar,
//   timestamp,
//   boolean,
//   integer,
//   smallint,
//   text
// } from 'drizzle-orm/pg-core';
// import { dbIssueType, User, dbIssueNotif } from '.';
// import { timestampConfig, length } from '../utils';
// import { relations } from 'drizzle-orm';

// export const dbIssue = pgTable('issue', {
//   id: serial('id').primaryKey(),
//   submittedOn: timestamp('submitted_on', timestampConfig).notNull().defaultNow(),
//   title: varchar('title', length(35)).notNull(),
//   body: text('body').notNull(),
//   type: dbIssueType('type').notNull(),
//   imageCount: smallint('image_count').notNull().default(0),
//   canContact: boolean('can_contact').notNull().default(false), // Allow admins to contact the user through Discord if necessary?
//   resolved: boolean('resolved').notNull().default(false),
//   submittedById: integer('submitted_by_id').references(() => User.id)
// });

// export const dbIssueRelations = relations(dbIssue, ({ one, many }) => ({
//   submittedBy: one(User, {
//     fields: [dbIssue.submittedById],
//     references: [User.id]
//   }),
//   inIssueNotifs: many(dbIssueNotif)
// }));
