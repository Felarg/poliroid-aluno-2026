/** Compatibilidade dos erros históricos da publicação com a API compartilhada. */
export {
  ApiError as PublicationError,
  apiErrorResponse as publicationErrorResponse,
  responseHeaders,
} from "@/server/api";
