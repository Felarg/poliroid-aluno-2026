/** Consulta o perfil público de um usuário. */
import { getUser } from "@/features/users/queries";
import { validateId } from "@/server/api";
import { apiErrorResponse, responseHeaders } from "@/server/api";

/** Lê o recurso com identidade resolvida no servidor e cache privado. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    return Response.json(
      await getUser(validateId((await context.params).userId)),
      { headers: responseHeaders },
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
