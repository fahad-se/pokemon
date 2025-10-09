import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import "./index.css";


const { Header: AntHeader } = Layout;

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <AntHeader className="site-header">
      <div className="nav-container">
        <Menu
          mode="horizontal"
          theme="dark"
          selectedKeys={[currentPath]}
          className="center-menu"
        >
          <Menu.Item key="/">
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="/about">
            <Link to="/about">About</Link>
          </Menu.Item>
          <Menu.Item key="/services">
            <Link to="/services">Services</Link>
          </Menu.Item>
          <Menu.Item key="/contact">
            <Link to="/contact">Contact</Link>
          </Menu.Item>
        </Menu> 
      </div>
    </AntHeader>
  );
};

export default Header;
