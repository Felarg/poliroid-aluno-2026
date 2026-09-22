/** Garante o estado desejado de follow para o usuário atual. */
import { setFollowing } from "@/features/social/operations";
import { validateId } from "@/server/api";
import { apiErrorResponse, responseHeaders } from "@/server/api";
import { invalidateSocialReads } from "@/server/cache";

async function change(
  request: Request,
  context: { params: Promise<{ userId: string }> },
  following: boolean,
) {
  try {
    const result = await setFollowing(
      validateId((await context.params).userId),
      following,
    );
    invalidateSocialReads();
    return Response.json(result, { headers: responseHeaders });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
/** Garante o estado ativo, inclusive quando a mesma operação é repetida. */
export function PUT(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  return change(request, context, true);
}
/** Garante o estado inativo respeitando as permissões atuais. */
export function DELETE(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  return change(request, context, false);
}
