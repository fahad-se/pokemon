import React from 'react';
import { Layout } from 'antd';
import './index.css';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter className="site-footer">
      <div className="footer-container">
        <div className="footer-left">
          <h3>MySite</h3>
          <p>&copy; {new Date().getFullYear()} MySite. All rights reserved.</p>
        </div>
        <div className="footer-right">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;
