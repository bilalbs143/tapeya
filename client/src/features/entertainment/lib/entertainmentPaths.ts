import { APP_PATHS } from '@/shared/config/paths';

export const entertainmentPaths = {
  list: () => APP_PATHS.entertainment,
  detail: (id: number | string) => `${APP_PATHS.entertainment}/${id}`,
  episode: (serialId: number | string, episodeId: number | string) =>
    `${APP_PATHS.entertainment}/${serialId}/e/${episodeId}`,
} as const;
