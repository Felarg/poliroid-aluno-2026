/** Perfil público: cabeçalho do usuário e galeria paginada de suas publicações. */
import { connection } from "next/server";
import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";
import { getUser } from "@/features/users/queries";
import { getUserPostsPage } from "@/features/publication/queries";
import { FollowButton } from "@/features/social/follow-button";
import { validateId, ApiError } from "@/server/api";
import { ProfileHeader } from "@/features/users/profile-header";
import { GalleryPostList } from "@/features/publication/gallery-post-list";
import type { Page } from "@/features/publication/contracts";
import type { PostDTO } from "@/features/publication/contracts";
import type { UserDTO } from "@/features/users/contracts";

/** Lê perfil e primeira página no servidor para manter a URL compartilhável. */
export default async function UserProfilePage({
  params,
}: PageProps<"/users/[userId]">) {
  await connection();
  const { userId: rawUserId } = await params;
  let user: UserDTO;
  let page: Page<PostDTO>;
  try {
    const userId = validateId(rawUserId);
    [user, page] = await Promise.all([
      getUser(userId),
      getUserPostsPage(userId, {}),
    ]);
  } catch (error) {
    if (error instanceof ApiError && [400, 404].includes(error.status)) {
      notFound();
    }
    throw error;
  }
  // Cada refresh reinicia a lista, inclusive quando somente canLike mudou.
  const listKey = randomUUID();
  return (
    <>
      <ProfileHeader
        user={user}
        actions={
          !user.isViewer && (
            <FollowButton
              key={user.id}
              userId={user.id}
              initialFollowing={user.followingByViewer}
            />
          )
        }
      />
      <GalleryPostList
        key={listKey}
        userId={user.id}
        posts={page.items}
        nextCursor={page.nextCursor}
      />
    </>
  );
}
