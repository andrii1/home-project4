import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './Faq.Style.css';

export const Faq = () => {
  return (
    <>
      <Helmet>
        <title>FAQ</title>
      </Helmet>
      <main>
        <h1 className="hero-header">FAQ</h1>
        <h2>How many deals are here?</h2>
        <p>There are 90+ tops deals.</p>
        <p>Reach out via agorh @ icloud.com</p>
      </main>
    </>
  );
};
