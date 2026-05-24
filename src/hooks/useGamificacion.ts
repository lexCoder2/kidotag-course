import { useCallback, useEffect, useState } from "react";

// ──────────────────────────────────────────────
// Sistema de gamificación: XP, niveles, racha e insignias
// Almacenado en localStorage; emite eventos para toasts y badges.
// ──────────────────────────────────────────────

export interface Insignia {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string; // emoji
  ganadaEn: string; // ISO date
}

export interface EstadoGamificacion {
  xp: number;
  nivel: number;
  insignias: Insignia[];
  racha: number; // días consecutivos
  ultimaActividad: string | null; // ISO date YYYY-MM-DD
  version: number;
}

const STORAGE_KEY = "kidotag-gamificacion";
const VERSION = 1;

// XP requerido por nivel: 100, 250, 450, 700, 1000, 1350, 1750, ...
// Fórmula: nivel N requiere 100 * N * (N+1) / 2 total
export function xpRequeridoParaNivel(nivel: number): number {
  if (nivel <= 0) return 0;
  return (100 * nivel * (nivel + 1)) / 2;
}

export function nivelDesdeXP(xp: number): number {
  let n = 0;
  while (xpRequeridoParaNivel(n + 1) <= xp) n += 1;
  return n;
}

export function xpEnNivelActual(xp: number): {
  actual: number;
  requerido: number;
  porcentaje: number;
} {
  const nivel = nivelDesdeXP(xp);
  const base = xpRequeridoParaNivel(nivel);
  const siguiente = xpRequeridoParaNivel(nivel + 1);
  const actual = xp - base;
  const requerido = siguiente - base;
  return {
    actual,
    requerido,
    porcentaje: Math.min(100, Math.round((actual / requerido) * 100)),
  };
}

function estadoInicial(): EstadoGamificacion {
  return {
    xp: 0,
    nivel: 0,
    insignias: [],
    racha: 0,
    ultimaActividad: null,
    version: VERSION,
  };
}

function cargar(): EstadoGamificacion {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return estadoInicial();
    const parsed = JSON.parse(raw) as EstadoGamificacion;
    if (parsed.version !== VERSION) return estadoInicial();
    return parsed;
  } catch {
    return estadoInicial();
  }
}

function guardar(estado: EstadoGamificacion) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch {
    // ignorar
  }
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function actualizarRacha(estado: EstadoGamificacion): EstadoGamificacion {
  const hoy = hoyISO();
  if (estado.ultimaActividad === hoy) return estado;

  let nuevaRacha = 1;
  if (estado.ultimaActividad) {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const ayerISO = ayer.toISOString().slice(0, 10);
    if (estado.ultimaActividad === ayerISO) {
      nuevaRacha = estado.racha + 1;
    }
  }
  return { ...estado, racha: nuevaRacha, ultimaActividad: hoy };
}

// Evento emitido cuando se gana XP
export interface XPGanadaDetalle {
  cantidad: number;
  razon: string;
  xpTotal: number;
  nivelNuevo?: number; // sólo si subió de nivel
}

// Evento emitido cuando se desbloquea una insignia
export interface InsigniaNuevaDetalle {
  insignia: Insignia;
}

export function useGamificacion() {
  const [estado, setEstado] = useState<EstadoGamificacion>(cargar);

  // Sincroniza entre pestañas
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setEstado(cargar());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const ganarXP = useCallback((cantidad: number, razon: string) => {
    setEstado((prev) => {
      const nivelAnterior = nivelDesdeXP(prev.xp);
      let nuevo: EstadoGamificacion = {
        ...prev,
        xp: prev.xp + cantidad,
      };
      nuevo = actualizarRacha(nuevo);
      nuevo.nivel = nivelDesdeXP(nuevo.xp);
      guardar(nuevo);

      const detalle: XPGanadaDetalle = {
        cantidad,
        razon,
        xpTotal: nuevo.xp,
        nivelNuevo: nuevo.nivel > nivelAnterior ? nuevo.nivel : undefined,
      };
      window.dispatchEvent(
        new CustomEvent<XPGanadaDetalle>("kidotag-xp-ganada", {
          detail: detalle,
        }),
      );
      return nuevo;
    });
  }, []);

  const desbloquearInsignia = useCallback(
    (
      id: string,
      titulo: string,
      descripcion: string,
      icono: string,
    ): boolean => {
      let desbloqueada = false;
      setEstado((prev) => {
        if (prev.insignias.some((i) => i.id === id)) return prev;
        const insignia: Insignia = {
          id,
          titulo,
          descripcion,
          icono,
          ganadaEn: new Date().toISOString(),
        };
        const nuevo: EstadoGamificacion = {
          ...prev,
          insignias: [...prev.insignias, insignia],
        };
        guardar(nuevo);
        desbloqueada = true;
        window.dispatchEvent(
          new CustomEvent<InsigniaNuevaDetalle>("kidotag-insignia-nueva", {
            detail: { insignia },
          }),
        );
        return nuevo;
      });
      return desbloqueada;
    },
    [],
  );

  const tieneInsignia = useCallback(
    (id: string): boolean => estado.insignias.some((i) => i.id === id),
    [estado.insignias],
  );

  const resetGamificacion = useCallback(() => {
    const inicial = estadoInicial();
    guardar(inicial);
    setEstado(inicial);
  }, []);

  return {
    xp: estado.xp,
    nivel: estado.nivel,
    insignias: estado.insignias,
    racha: estado.racha,
    progresoNivel: xpEnNivelActual(estado.xp),
    ganarXP,
    desbloquearInsignia,
    tieneInsignia,
    resetGamificacion,
  };
}
