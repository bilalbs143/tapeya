/**
 * Minimal shape for nested post/comment/reply data used by normalizeReplies.
 * Define a full Post type in your app when you have profile/content modules.
 */
interface PostDataCommentReply {
  data: { replies?: PostDataCommentReply[] };
}
interface PostDataComment {
  data: { replies?: PostDataCommentReply[] };
}
interface Post {
  data: { comments?: PostDataComment[] };
}

export function normalizeReplies(posts: Post[]): Post[] {
  return posts.map((post) => ({
    ...post,
    data: {
      ...post.data,
      comments: (post.data.comments ?? []).map((comment) => ({
        ...comment,
        data: {
          ...comment.data,
          replies: (comment.data.replies ?? []).map((reply) => ({
            ...reply,
            data: {
              ...reply.data,
              replies: reply.data.replies ?? [],
            },
          })),
        },
      })),
    },
  }));
}
