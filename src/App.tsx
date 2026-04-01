import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Home } from "@/src/pages/Home";
import { ArticleDetail } from "@/src/pages/ArticleDetail";
import { CategoryPage } from "@/src/pages/CategoryPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/category/:category" element={<CategoryPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}
