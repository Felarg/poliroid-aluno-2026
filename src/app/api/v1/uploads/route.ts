/** Endpoint de autorização; os bytes são enviados pelo navegador diretamente ao MinIO. */
import { createUpload } from "@/features/publication/operations";
import {
  publicationErrorResponse,
  responseHeaders,
} from "@/features/publication/errors";

/** Cria uma tentativa privada para o viewer resolvido no servidor. */
export async function POST(request: Request) {
  try {
    return Response.json(await createUpload(await request.json()), {
      status: 201,
      headers: responseHeaders,
    });
  } catch (error) {
    return publicationErrorResponse(error);
  }
}
