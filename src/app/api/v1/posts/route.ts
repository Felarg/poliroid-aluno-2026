/** Endpoint de confirmação, compartilhando a regra idempotente com o domínio. */
import { publishPost } from "@/features/publication/operations";
import {
  publicationErrorResponse,
  responseHeaders,
} from "@/features/publication/errors";
import { invalidatePosts } from "@/server/cache";

/** Publica somente depois da validação e persistência da imagem final. */
export async function POST(request: Request) {
  try {
    const result = await publishPost(await request.json());
    // Repetir uma publicação confirmada também repara uma invalidação perdida.
    invalidatePosts();
    return Response.json(result.post, {
      status: result.created ? 201 : 200,
      headers: responseHeaders,
    });
  } catch (error) {
    return publicationErrorResponse(error);
  }
}
