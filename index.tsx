import {createRoot} from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root')!);

root.render(
  <div
    style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    }}>
    <App />
  </div>,
);
