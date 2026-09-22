/** Contratos públicos da publicação, compartilhados pela API e pela interface. */

/** Metadados de um post; a imagem é carregada diretamente do storage público. */
export interface PostDTO {
  id: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  caption: string;
  createdAt: string;
  likeCount: number;
  likedByViewer: boolean;
  canLike: boolean;
}

/** Página limitada e ordenada por data e id, usada por galeria e feed. */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

/** Autorização temporária que pertence somente à tentativa atual do navegador. */
export interface UploadAuthorization {
  uploadId: string;
  uploadUrl: string;
  fields: Record<string, string>;
  uploadUrlExpiresAt: string;
  expiresAt: string;
}

/** Limite comum ao formulário, à autorização e à leitura do arquivo. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
