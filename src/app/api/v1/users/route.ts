/** Busca usuários por nome ou username, com limite server-side. */
import { searchUsers } from "@/features/users/queries";
import { ApiError, apiErrorResponse, responseHeaders } from "@/server/api";

/** Lê o recurso com identidade resolvida no servidor e cache privado. */
export async function GET(request: Request) {
  try {
    const term = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    const length = Array.from(term).length;
    if (length < 2 || length > 50) {
      throw new ApiError(
        400,
        "INVALID_QUERY",
        "A busca deve ter entre 2 e 50 caracteres.",
      );
    }
    return Response.json(await searchUsers(term), { headers: responseHeaders });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
