import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "@/pages/Index";

function App() {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
          </Routes>
        </TooltipProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
}

export default App;
