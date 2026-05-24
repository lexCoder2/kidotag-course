import { writeFileSync } from "fs";

const content = [
  "import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'",
  "import { Layout } from '@/components/Layout'",
  "import { Home } from '@/pages/Home'",
  "import { LeccionPage } from '@/pages/LeccionPage'",
  "import { useProgress } from '@/hooks/useProgress'",
  "import { CURRICULUM, TOTAL_LECCIONES } from '@/data/curriculum'",
  "",
  "export default function App() {",
  "  const progress = useProgress()",
  "  return (",
  "    <BrowserRouter>",
  "      <Routes>",
  "        <Route",
  "          path='/'",
  "          element={<Layout progress={progress} totalLecciones={TOTAL_LECCIONES} curriculum={CURRICULUM} />}",
  "        >",
  "          <Route index element={<Home progress={progress} />} />",
  "          <Route path='leccion/:slug' element={<LeccionPage progress={progress} />} />",
  "        </Route>",
  "        <Route path='*' element={<Navigate to='/' replace />} />",
  "      </Routes>",
  "    </BrowserRouter>",
  "  )",
  "}",
].join("\n");

writeFileSync("src/App.tsx", content, "utf8");
console.log("App.tsx escrito OK");
