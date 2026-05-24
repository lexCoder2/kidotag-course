// Declaración TypeScript para importar archivos .mdx como componentes React
declare module "*.mdx" {
  import type { ComponentType } from "react";
  const MDXComponent: ComponentType;
  export default MDXComponent;
}
