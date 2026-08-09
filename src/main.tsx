import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LOGO_IMAGE } from './assets/logoDataUri.ts';

// Enforce document title and favicon dynamically
document.title = 'Panahan Bandung';

const setFavicon = (href: string) => {
  let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'shortcut icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.type = 'image/png';
  link.href = href;
};

try {
  setFavicon(LOGO_IMAGE);
} catch (e) {
  console.error('Failed to set favicon dynamically:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

