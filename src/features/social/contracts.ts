/** Respostas pequenas das mutações de follows e likes. */
export interface FollowResult {
  followingByViewer: boolean;
}

export interface LikeResult {
  likedByViewer: boolean;
  likeCount: number;
  canLike: true;
}
