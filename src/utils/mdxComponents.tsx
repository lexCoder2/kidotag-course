/**
 * Componentes globales inyectados en todos los archivos MDX
 * a través del MDXProvider en main.tsx.
 */
import { Callout } from "@/components/Callout";
import { LessonQuizGate } from "@/components/LessonQuizGate";
import { CodePlayground } from "@/components/CodePlayground";
import { Mermaid } from "@/components/Mermaid";
import { ApiPlayground } from "@/components/ApiPlayground";
import { LibCard } from "@/components/LibCard";
import { SmartCodeBlock } from "@/components/SmartCodeBlock";
import { MdxImage } from "@/components/MdxImage";
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  Callout,
  Quiz: LessonQuizGate,
  CodePlayground,
  Mermaid,
  ApiPlayground,
  LibCard,
  img: MdxImage,
  pre: SmartCodeBlock,
};
