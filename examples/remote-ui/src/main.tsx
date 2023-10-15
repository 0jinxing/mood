import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import ClientPage from './routes/Client';
import EmbedPage from './routes/Embed';
import App from './App';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/client',
    element: <ClientPage />
  },
  {
    path: '/embed',
    element: <EmbedPage />
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
