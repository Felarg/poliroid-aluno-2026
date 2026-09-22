/** Feed cronológico montado na leitura a partir dos follows ativos. */
import { getFeedPage } from "@/features/publication/queries";
import { pageOptions } from "@/features/publication/pagination";
import { apiErrorResponse, responseHeaders } from "@/server/api";

/** Lê o recurso com identidade resolvida no servidor e cache privado. */
export async function GET(request: Request) {
  try {
    return Response.json(
      await getFeedPage(pageOptions(new URL(request.url).searchParams)),
      { headers: responseHeaders },
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
