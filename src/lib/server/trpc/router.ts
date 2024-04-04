import * as v from 'valibot';
import { t } from '$trpc';
import { notificationsRouter, tournamentsRouter, usersRouter } from '../procedures';
import { wrap } from '@typeschema/valibot';
import { getSession } from '$lib/server/helpers/trpc';
import { Ban, db, OsuUser, Tournament, User } from '$db';
import { and, asc, eq, ilike, isNull, notExists, or, type SQL, sql } from 'drizzle-orm';
import { future, pick, trpcUnknownError } from '$lib/server/utils';

const search = t.procedure.input(wrap(v.string())).query(async ({ ctx, input }) => {
  getSession(ctx.cookies, true);

  let users:
    | (Pick<typeof User.$inferSelect, 'id' | 'osuUserId'> & {
        username: string;
      })[]
    | undefined;

  try {
    const isBanned = db.$with('is_banned').as(
      db
        .select()
        .from(Ban)
        .where(
          sql`select 1
              from ${Ban}
              where ${and(
                eq(Ban.issuedToUserId, +input),
                and(isNull(Ban.revokedAt), or(isNull(Ban.liftAt), future(Ban.liftAt)))
              )}
              limit 1
          `
        )
    );

    const userWhereCondition: SQL[] = [
      eq(User.discordUserId, input),
      ilike(OsuUser.username, `%${input}%`)
    ];

    if (!isNaN(parseInt(input))) {
      userWhereCondition.push(eq(User.id, +input), eq(User.osuUserId, +input));
    }

    users = await db
      .with(isBanned)
      .select({
        ...pick(User, ['id', 'osuUserId']),
        username: OsuUser.username
      })
      .from(User)
      .innerJoin(OsuUser, eq(User.osuUserId, OsuUser.osuUserId))
      .where(and(notExists(isBanned), or(...userWhereCondition)))
      .orderBy(asc(OsuUser.username))
      .limit(10);
  } catch (err) {
    throw trpcUnknownError(err, 'Searching for users');
  }

  let tournaments:
    | Pick<
        typeof Tournament.$inferSelect,
        'name' | 'urlSlug' | 'acronym' | 'logoMetadata' | 'bannerMetadata'
      >[]
    | undefined;

  const tournamentWhereCondition: SQL[] = [
    ilike(Tournament.name, `%${input}%`),
    ilike(Tournament.acronym, `%${input}%`),
    ilike(Tournament.urlSlug, `%${input}%`)
  ];

  if (!isNaN(parseInt(input))) {
    tournamentWhereCondition.push(eq(Tournament.id, +input));
  }

  try {
    tournaments = await db
      .select({
        ...pick(Tournament, ['name', 'urlSlug', 'acronym', 'logoMetadata', 'bannerMetadata'])
      })
      .from(Tournament)
      .where(and(eq(Tournament.deleted, false), or(...tournamentWhereCondition)))
      .orderBy(asc(Tournament.name))
      .limit(10);
  } catch (err) {
    throw trpcUnknownError(err, 'Searching for tournaments');
  }

  return {
    users,
    tournaments
  };
});

export const router = t.router({
  search,
  users: usersRouter,
  tournaments: tournamentsRouter,
  notifications: notificationsRouter
});

export type Router = typeof router;
