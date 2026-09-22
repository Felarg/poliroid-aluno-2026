/** Consulta pública de um post confirmado, usando o mesmo contrato da publicação. */
import { validateId } from "@/server/api";
import { getPost } from "@/features/publication/queries";
import {
  publicationErrorResponse,
  responseHeaders,
} from "@/features/publication/errors";

/** Retorna metadados e URL imutável; o navegador lê a imagem no MinIO. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await context.params;
    return Response.json(await getPost(validateId(postId)), {
      headers: responseHeaders,
    });
  } catch (error) {
    return publicationErrorResponse(error);
  }
}
