// Tipos del sistema de desafíos guiados paso a paso.
// Un Desafio reemplaza el array plano de `verificaciones` en CodePlayground/MonacoSandpackEditor.
// Cada PasoDesafio se desbloquea secuencialmente; el paso actual bloquea el siguiente
// hasta que todas sus verificaciones pasen.

import type { SandpackFiles } from "@codesandbox/sandpack-react";
import type { Verificacion } from "./verificaciones";

// Un concepto introducido por primera vez en una lección.
// Se usa para generar comentarios inline en codigoInicial y para enlazar
// con un sandbox preparatorio cuando el concepto requiere más contexto.
export interface ConceptoNuevo {
  termino: string;
  explicacion: string; // 1-2 oraciones
  ejemplo?: string; // fragmento de código como string
  sandboxPreparatorio?: string; // slug de lección cuyo sandbox explica este concepto
}

// Un paso dentro de un desafío guiado.
// Todas las verificaciones deben pasar antes de que el siguiente paso se desbloquee.
export interface PasoDesafio {
  id: string;
  titulo: string;
  // Descripción de la tarea (puede usar markdown simple)
  descripcion: string;
  pista?: string;
  // Archivos a aplicar al sandbox cuando este paso se vuelve activo.
  // Claves = rutas de archivo (ej. "/app.js"), valores = contenido completo.
  // Si está ausente, el editor conserva el código del paso anterior.
  codigoInicial?: SandpackFiles;
  verificaciones: Verificacion[];
}

// Un desafío guiado completo. Reemplaza el array plano de `verificaciones`.
export interface Desafio {
  id: string;
  titulo: string;
  // Párrafo corto explicando qué va a construir el estudiante
  intro: string;
  objetivo?: string; // reemplaza el prop `objetivo` de CodePlayground
  retoFinal?: string;
  // Conceptos introducidos por primera vez; pueden disparar comentarios inline
  conceptosNuevos?: ConceptoNuevo[];
  // Pasos ordenados; se completan secuencialmente
  pasos: PasoDesafio[];
  // Cita el/los archivo(s) de kidotag10 que este desafío modela
  referenciaKidotag?: string;
}
