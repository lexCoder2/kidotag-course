/**
 * mock-bcrypt.ts — clon determinístico de bcryptjs para el runner NodeApi.
 *
 * Hash format: "$mock$<rounds>$<base64(password)>"
 * Esto evita dependencias de crypto y permite verificación offline.
 * No usar en producción — sólo para tests educativos.
 */

function b64encode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

function b64decode(b64: string): string {
  return decodeURIComponent(escape(atob(b64)));
}

function isMockHash(hash: string): boolean {
  return hash.startsWith("$mock$");
}

const bcrypt = {
  /**
   * Genera un hash mock. `rounds` se guarda pero no cambia el output
   * (ya que es sólo para tests, no para seguridad).
   */
  async hash(password: string, saltOrRounds: number | string): Promise<string> {
    const rounds = typeof saltOrRounds === "number" ? saltOrRounds : 10;
    return `$mock$${rounds}$${b64encode(password)}`;
  },

  /**
   * Compara un password en texto plano con un hash mock.
   * Soporta tanto hashes mock como bcrypt reales (siempre retorna false para reales,
   * ya que no tenemos la librería nativa en el runner).
   */
  async compare(password: string, hash: string): Promise<boolean> {
    if (!isMockHash(hash)) {
      // No podemos comparar hashes bcrypt reales en el runner
      return false;
    }
    const parts = hash.split("$");
    // format: ["", "mock", rounds, b64password]
    if (parts.length < 4) return false;
    try {
      return b64decode(parts[3]) === password;
    } catch {
      return false;
    }
  },

  async genSalt(rounds = 10): Promise<string> {
    return `$mock-salt$${rounds}`;
  },

  /**
   * Versión sincrónica (usada por algunos códigos de ejemplo).
   */
  hashSync(password: string, saltOrRounds: number | string = 10): string {
    const rounds = typeof saltOrRounds === "number" ? saltOrRounds : 10;
    return `$mock$${rounds}$${b64encode(password)}`;
  },

  compareSync(password: string, hash: string): boolean {
    if (!isMockHash(hash)) return false;
    const parts = hash.split("$");
    if (parts.length < 4) return false;
    try {
      return b64decode(parts[3]) === password;
    } catch {
      return false;
    }
  },
};

export type MockBcrypt = typeof bcrypt;
export const mockBcryptModule = bcrypt;
export default bcrypt;
