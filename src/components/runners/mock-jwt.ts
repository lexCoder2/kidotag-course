/**
 * mock-jwt.ts — clon de jsonwebtoken para el runner NodeApi.
 *
 * Usa btoa/atob para la "firma" (no es seguro criptográficamente — sólo para tests).
 * Token format: base64(header).base64(payload).base64(secret+payload)
 *
 * Exporta el objeto compatible con `require("jsonwebtoken")`.
 */

export class JwtError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JsonWebTokenError";
  }
}

export class TokenExpiredError extends JwtError {
  expiredAt: Date;
  constructor(message: string, expiredAt: Date) {
    super(message);
    this.name = "TokenExpiredError";
    this.expiredAt = expiredAt;
  }
}

function safeB64Encode(obj: unknown): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

function safeB64Decode(b64: string): unknown {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch {
    throw new JwtError("Token mal formado");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Payload = Record<string, any>;
type StringOrBuffer = string | Buffer;
interface SignOptions {
  expiresIn?: string | number; // "1h", "7d", 3600
  algorithm?: string;
  issuer?: string;
  audience?: string;
  subject?: string;
}
interface VerifyOptions {
  algorithms?: string[];
  issuer?: string;
  audience?: string;
}
interface DecodeOptions {
  complete?: boolean;
}

function parseExpiresIn(expiresIn: string | number): number {
  if (typeof expiresIn === "number") return expiresIn;
  const match = /^(\d+)([smhd]?)$/.exec(expiresIn);
  if (!match) return 3600;
  const n = parseInt(match[1]);
  const unit = match[2] || "s";
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };
  return n * (multipliers[unit] ?? 1);
}

const jwt = {
  sign(
    payload: Payload,
    secret: StringOrBuffer,
    options: SignOptions = {},
  ): string {
    const header = { alg: options.algorithm ?? "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const claims: Payload = { ...payload, iat: now };

    if (options.expiresIn !== undefined) {
      claims.exp = now + parseExpiresIn(options.expiresIn);
    }
    if (options.issuer) claims.iss = options.issuer;
    if (options.audience) claims.aud = options.audience;
    if (options.subject) claims.sub = options.subject;

    const secretStr = typeof secret === "string" ? secret : secret.toString();
    const headerB64 = safeB64Encode(header);
    const payloadB64 = safeB64Encode(claims);
    // "firma" determinística — NO criptográficamente segura
    const sigRaw = safeB64Encode({ s: secretStr, p: payloadB64 });
    return `${headerB64}.${payloadB64}.${sigRaw}`;
  },

  verify(
    token: string,
    secret: StringOrBuffer,
    _options: VerifyOptions = {},
  ): Payload {
    const parts = token.split(".");
    if (parts.length !== 3) throw new JwtError("Token mal formado");

    const payload = safeB64Decode(parts[1]) as Payload;
    const secretStr = typeof secret === "string" ? secret : secret.toString();

    // Verificar "firma"
    const expectedSig = safeB64Encode({ s: secretStr, p: parts[1] });
    if (expectedSig !== parts[2]) throw new JwtError("Firma inválida");

    // Verificar expiración
    if (payload.exp !== undefined) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new TokenExpiredError(
          "Token expirado",
          new Date(payload.exp * 1000),
        );
      }
    }

    return payload;
  },

  decode(token: string, options: DecodeOptions = {}): unknown {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    try {
      const payload = safeB64Decode(parts[1]) as Payload;
      if (options.complete) {
        return {
          header: safeB64Decode(parts[0]),
          payload,
          signature: parts[2],
        };
      }
      return payload;
    } catch {
      return null;
    }
  },

  JsonWebTokenError: JwtError,
  TokenExpiredError,
};

export type MockJwt = typeof jwt;
export const mockJwtModule = jwt;
export default jwt;
