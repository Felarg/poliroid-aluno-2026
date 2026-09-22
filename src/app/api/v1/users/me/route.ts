/** Retorna o perfil do viewer resolvido exclusivamente no servidor. */
import { getUser } from "@/features/users/queries";
import { getViewerId } from "@/server/identity";
import { apiErrorResponse, responseHeaders } from "@/server/api";

/** Lê o recurso com identidade resolvida no servidor e cache privado. */
export async function GET() {
  try {
    return Response.json(await getUser(getViewerId()), {
      headers: responseHeaders,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
