/** Contratos de usuários usados pelas leituras de perfil e busca. */

export interface UserDTO {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  isViewer: boolean;
  followingByViewer: boolean;
}

export interface UserSearchResult {
  items: UserDTO[];
  truncated: boolean;
}
