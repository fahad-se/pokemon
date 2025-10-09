import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "../../component/header/Index";
import Footer from "../../component/footer/Index";
import Home from "../../Component/Home/Home";
import Service from "../../Component/Servicess/Service";

// import './RouterF.css';

const RouterF = () => {
  return (
    <Router>
      <div className="layout-wrapper">
        <Header />

        <div className="content-wrapper">
          <Routes>
            {/* Example route */}
            {/* <Route path="/" element={<Home />} /> */}
              <Route path="/" element={<Home />} />
              {/* Add more routes as needed */}
              <Route path="/services" element={<Service />} />
            

          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
};

export default RouterF;
