import "server-only";

/** Lê uma configuração obrigatória sem incluir seu valor em mensagens de erro. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Configure a variável ${name} no arquivo .env.`);
  }
  return value;
}
