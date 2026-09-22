import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import L from 'leaflet';

// Ensure global L is defined on window before leaflet.markercluster loads
if (typeof window !== 'undefined') {
  (window as unknown as { L: typeof L }).L = L;
}

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
