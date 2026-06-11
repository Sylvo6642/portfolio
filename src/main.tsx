import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const a = 'color:#e8e8e8;font-weight:600';
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
  Caught you snooping 🕵️
%c
  No bugs here. I mean... probably.
  If you find one, it's a feature. If you find two, we don't talk about it.

  If you're hiring (or just want to roast my code):
  → robinkevin648@gmail.com
  → kevinsylvester.xyz/#contact
`,
  a, c, b,
);

document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  if (e.key === 'F12') { e.preventDefault(); return; }
  if (e.ctrlKey && e.shiftKey && ['I', 'C', 'J'].includes(e.key)) { e.preventDefault(); return; }
  if (e.ctrlKey && e.key === 'U') { e.preventDefault(); return; }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
