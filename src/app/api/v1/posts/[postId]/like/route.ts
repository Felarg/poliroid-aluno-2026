/** Garante a presença ou ausência da curtida do viewer. */
import { setLike } from "@/features/social/operations";
import { validateId } from "@/server/api";
import { apiErrorResponse, responseHeaders } from "@/server/api";
import { invalidatePosts } from "@/server/cache";

async function change(
  context: { params: Promise<{ postId: string }> },
  liked: boolean,
) {
  try {
    const result = await setLike(
      validateId((await context.params).postId),
      liked,
    );
    invalidatePosts();
    return Response.json(result, { headers: responseHeaders });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
/** Garante o estado ativo, inclusive quando a mesma operação é repetida. */
export function PUT(
  _request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  return change(context, true);
}
/** Garante o estado inativo respeitando as permissões atuais. */
export function DELETE(
  _request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  return change(context, false);
}
