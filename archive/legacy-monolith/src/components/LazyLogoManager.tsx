import { lazy, Suspense } from 'react';
import Loading from './Loading';

// Lazy load the heavy LogoManager component
const LogoManagerLazy = lazy(() => import('./LogoManager'));

interface LazyLogoManagerProps {
  children?: React.ReactNode;
}

const LazyLogoManager: React.FC<LazyLogoManagerProps> = ({ children }) => {
  return (
    <Suspense fallback={<Loading variant="spinner" />}>
      <LogoManagerLazy />
    </Suspense>
  );
};

export default LazyLogoManager;
