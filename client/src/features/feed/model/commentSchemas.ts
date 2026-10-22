import { z } from 'zod';

import { formatRelativeAge } from './schemas';

const commentUserWireSchema = z.object({
  id: z.number().nullable().optional(),
  name: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  is_official: z.boolean().optional(),
});

/** Wire shape from `PostCommentResource` / `DramaEpisodeCommentResource`. */
export const commentWireSchema = z.object({
  id: z.number(),
  post_id: z.number().nullable().optional(),
  episode_id: z.number().nullable().optional(),
  parent_id: z.number().nullable().optional(),
  body: z.string(),
  likes_count: z.number().optional(),
  liked: z.boolean().optional(),
  is_pinned: z.boolean().optional(),
  replies_count: z.number().optional(),
  user: commentUserWireSchema.optional(),
  created_at: z.string().nullable().optional(),
});

export type CommentWire = z.infer<typeof commentWireSchema>;

export const commentPageWireSchema = z.object({
  items: z.array(commentWireSchema),
  current_page: z.number(),
  last_page: z.number(),
  per_page: z.number().optional(),
  total: z.number().optional(),
});

export type CommentAuthor = {
  id: number | null;
  name: string;
  handle: string;
  nickname: string | null;
  avatarUrl: string | null;
  isOfficial: boolean;
};

export type Comment = {
  id: number;
  postId: number | null;
  parentId: number | null;
  body: string;
  likes: number;
  liked: boolean;
  repliesCount: number;
  age: string;
  author: CommentAuthor;
};

export type CommentPage = {
  items: Comment[];
  currentPage: number;
  lastPage: number;
  total: number;
};

export function toComment(wire: CommentWire): Comment {
  const nickname = wire.user?.nickname?.trim() || null;
  const name = wire.user?.name?.trim() || nickname || 'Player';
  const handle = nickname || (wire.user?.id != null ? `user${wire.user.id}` : 'user');
  return {
    id: wire.id,
    postId: wire.post_id ?? null,
    parentId: wire.parent_id ?? null,
    body: wire.body,
    likes: Number(wire.likes_count ?? 0),
    liked: Boolean(wire.liked),
    repliesCount: Number(wire.replies_count ?? 0),
    age: formatRelativeAge(wire.created_at),
    author: {
      id: wire.user?.id ?? null,
      name,
      handle,
      nickname,
      avatarUrl: wire.user?.avatar_url ?? null,
      isOfficial: Boolean(wire.user?.is_official),
    },
  };
}

export const COMMENT_MAX = 500;
