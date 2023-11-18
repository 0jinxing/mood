import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import MirrorPage from './routes/Mirror';
import EmbedPage from './routes/Embed';
import App from './App';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/mirror',
    element: <MirrorPage />
  },
  {
    path: '/embed',
    element: <EmbedPage />
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
