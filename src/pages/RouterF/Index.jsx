import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "../../component/header/Index";
import Footer from "../../component/footer/Index";
import Home from "../../Component/Home/Home";
import Service from "../../Component/Servicess/Service";
import PokemonDetail from "../Pokemon/PokemonDetail";

// import './RouterF.css';

const RouterF = () => {
  return (
    <Router>
      <div className="layout-wrapper">
        <Header />

        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
            <Route path="/services" element={<Service />} />

          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
};

export default RouterF;
