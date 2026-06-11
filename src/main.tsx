import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const a = 'color:#e8762c;font-weight:600';
const b = 'color:#6b6b7a;font-weight:400';
const c = 'color:#f5f5f5;font-weight:500';
console.log(
  `%c
  ██╗  ██╗██████╗
  ██║ ██╔╝██╔══██╗
  █████╔╝ ██████╔╝
  ██╔═██╗ ██╔══██╗
  ██║  ██╗██║  ██║
  ╚═╝  ╚═╝╚═╝  ╚═╝
%c
  Hey there, fellow dev 👀
%c
  Poking around the source? Respect.
  This portfolio is built with React + Vite + Tailwind.
  The connecting dots are pure canvas — no lib.

  If you're hiring or just want to talk code:
  → robinkevin648@gmail.com
  → kevinsylvester.xyz/#contact
`,
  a, c, b,
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
