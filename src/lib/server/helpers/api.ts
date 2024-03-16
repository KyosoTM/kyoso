import * as v from 'valibot';
import { apiError, pick } from '$lib/server/utils';
import { error } from '@sveltejs/kit';
import { baseGetSession, baseGetStaffMember } from './base';
import { Notification, OsuUser, Tournament, User, UserNotification, db } from '$db';
import { desc, eq, inArray } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';
import type { AuthSession } from '$types';

export async function getStaffMember<T extends boolean>(
  session: AuthSession | undefined,
  tournamentId: number,
  route: { id: string | null },
  mustBeStaffMember?: T
) {
  return baseGetStaffMember<T>(
    session,
    tournamentId,
    false,
    {
      onGetStaffMemberError: async (err) => {
        throw await apiError(err, 'Getting the current user as a staff member', route);
      }
    },
    mustBeStaffMember
  );
}

export function getSession<T extends boolean>(
  cookies: Cookies,
  mustBeSignedIn?: T
): T extends true ? AuthSession : AuthSession | undefined {
  return baseGetSession<T>(cookies, false, mustBeSignedIn);
}

export async function getNotifications(
  userId: number,
  pagination: { limit: number; offset: number },
  route: { id: string | null }
) {
  let notifications: {
    notifiedAt: Date;
    read: boolean;
    message: string;
  }[] = [];

  try {
    notifications = await db
      .select({
        notifiedAt: UserNotification.notifiedAt,
        read: UserNotification.read,
        message: Notification.message
      })
      .from(UserNotification)
      .innerJoin(Notification, eq(Notification.id, UserNotification.notificationId))
      .where(eq(UserNotification.userId, userId))
      .orderBy(desc(UserNotification.notifiedAt))
      .limit(pagination.limit)
      .offset(pagination.offset);
  } catch (err) {
    throw await apiError(err, 'Getting the notifications', route);
  }

  const messageVars = Array.from(
    new Set(notifications.map(({ message }) => message.match(/(\w+):(\w+)/g) || []).flat())
  );

  const tournamentsToGet: number[] = [];
  const usersToGet: number[] = [];

  let tournaments: Pick<typeof Tournament.$inferSelect, 'name' | 'urlSlug'>[] = [];
  let users: (Pick<typeof User.$inferSelect, 'id'> &
    Pick<typeof OsuUser.$inferSelect, 'username'>)[] = [];

  for (let i = 0; i < messageVars.length; i++) {
    const split = messageVars[i].split(':');
    const thing = split[0];
    const id = split[1];

    switch (thing) {
      case 'tournament':
        tournamentsToGet.push(Number(id));
        break;
      case 'user':
        usersToGet.push(Number(id));
        break;
      default:
        console.warn('Unknown variable in notification message');
        break;
    }
  }

  if (tournamentsToGet.length > 0) {
    try {
      tournaments = await db
        .select(pick(Tournament, ['name', 'urlSlug']))
        .from(Tournament)
        .where(inArray(Tournament.id, tournamentsToGet));
    } catch (err) {
      throw await apiError(err, 'Getting the tournaments', route);
    }
  }

  if (usersToGet.length > 0) {
    try {
      users = await db
        .select({
          id: User.id,
          username: OsuUser.username
        })
        .from(User)
        .innerJoin(OsuUser, eq(OsuUser.osuUserId, User.osuUserId))
        .where(inArray(User.id, usersToGet));
    } catch (err) {
      throw await apiError(err, 'Getting the users', route);
    }
  }

  return {
    notifications,
    meta: {
      tournaments,
      users
    }
  };
}

export async function parseSearchParams<T extends Record<string, v.BaseSchema>>(
  url: URL,
  schemas: T,
  route: { id: string | null }
): Promise<{ [K in keyof T]: v.Output<T[K]> }> {
  const data: Record<string, any> = {};

  try {
    for (const key in schemas) {
      data[key] = v.parse(schemas[key], url.searchParams.get(key));
    }
  } catch (err) {
    if (err instanceof v.ValiError) {
      let str = 'Invalid input:\n';
      const issues = v.flatten(err.issues).nested;

      for (const key in issues) {
        str += `- Param "${key}" should ${issues[key]}\n`;
      }

      str = str.trimEnd();
      error(400, str);
    } else {
      throw await apiError(err, 'Parsing the URL search parameters', route);
    }
  }

  return data as any;
}
