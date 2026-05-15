import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Product from "./pages/Product";
import HowItWorks from "./pages/HowItWorks";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Workflow from "./pages/Workflow";
import NotFound from "./pages/NotFound";
import Calculator from "./pages/Calculator";
import { StoreProvider } from "./lib/store";

const App = () => (
  <StoreProvider>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/product" element={<Product />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StoreProvider>
);

export default App;
