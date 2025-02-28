import { usersRouter } from './routes';
import { t } from '$trpc';

export const router = t.router({
  // auth: authRouter,
  // tournaments: tournamentRouter,
  // uploads: uploadRouter,
  // validation: validationRouter,
  users: usersRouter
  // stages: stagesRouter,
  // rounds: roundsRouter,
  // modMultipliers: modMultipliersRouter,
  // prizes: prizesRouter,
  // staffMembers: staffMembersRouter,
  // staffRoles: staffRolesRouter,
  // modpools: modpoolsRouter,
  // pooledMaps: pooledMapsRouter,
  // suggestedMaps: suggestedMapsRouter,
  // markdown: markdownRouter
});

export type Router = typeof router;
