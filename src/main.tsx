import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MDXProvider } from "@mdx-js/react";
import { mdxComponents } from "@/utils/mdxComponents";
import "./index.css";
import "./App.css";
import App from "./App.tsx";

// Restore URLs redirected by public/404.html on GitHub Pages.
if (window.location.search) {
  const query = window.location.search.slice(1);
  if (query && !query.includes("=")) {
    const restoredPath = query.replace(/~and~/g, "&");
    const target =
      window.location.pathname +
      (restoredPath.startsWith("/") ? restoredPath : `/${restoredPath}`) +
      window.location.hash;
    window.history.replaceState(null, "", target);
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MDXProvider components={mdxComponents}>
      <App />
    </MDXProvider>
  </StrictMode>,
);
