import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Preloader from './components/common/Preloader';

/** Fixed 3s brand splash on site start. Home mounts underneath and fetches
 *  in parallel, so listings are already resolving when the splash fades. */
const SPLASH_MS = 3000;
const FADE_MS = 500;

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashGone, setSplashGone] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setShowSplash(false), SPLASH_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showSplash) {
      const t = window.setTimeout(() => setSplashGone(true), FADE_MS);
      return () => window.clearTimeout(t);
    }
  }, [showSplash]);

  return (
    <BrowserRouter>
      {!splashGone && <Preloader fading={!showSplash} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
