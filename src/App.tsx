import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import CreateMemorial from "@/pages/CreateMemorial";
import MemorialDetail from "@/pages/MemorialDetail";
import Reminders from "@/pages/Reminders";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cream-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateMemorial />} />
            <Route path="/edit/:id" element={<CreateMemorial />} />
            <Route path="/memorial/:id" element={<MemorialDetail />} />
            <Route path="/reminders" element={<Reminders />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
