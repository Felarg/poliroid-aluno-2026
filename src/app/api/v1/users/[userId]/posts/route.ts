/** Página da galeria pública de um usuário. */
import { getUserPostsPage } from "@/features/publication/queries";
import { getUser } from "@/features/users/queries";
import { pageOptions } from "@/features/publication/pagination";
import { validateId } from "@/server/api";
import { apiErrorResponse, responseHeaders } from "@/server/api";

/** Lê o recurso com identidade resolvida no servidor e cache privado. */
export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const userId = validateId((await context.params).userId);
    await getUser(userId);
    return Response.json(
      await getUserPostsPage(
        userId,
        pageOptions(new URL(request.url).searchParams),
      ),
      { headers: responseHeaders },
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
