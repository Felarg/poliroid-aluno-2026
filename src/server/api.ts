/** Erros e respostas compartilhados pelos Route Handlers da API. */
import "server-only";

/** Representa uma falha esperada que a API pode explicar ao cliente. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Dados personalizados devem sempre ser lidos novamente no servidor. */
export const responseHeaders = { "Cache-Control": "private, no-store" };

/** Converte falhas esperadas em envelope JSON sem expor detalhes internos. */
export function apiErrorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status, headers: responseHeaders },
    );
  }
  if (error instanceof SyntaxError) {
    return Response.json(
      { error: { code: "INVALID_JSON", message: "Envie um JSON válido." } },
      { status: 400, headers: responseHeaders },
    );
  }
  console.error("Falha inesperada na operação da API.");
  return Response.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Não foi possível concluir. Tente novamente.",
      },
    },
    { status: 500, headers: responseHeaders },
  );
}

/** Valida identificadores antes de enviá-los ao PostgreSQL. */
export function validateId(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new ApiError(400, "INVALID_ID", "Informe um identificador válido.");
  }
  return value.toLowerCase();
}
