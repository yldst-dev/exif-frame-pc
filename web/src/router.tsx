import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TermAndConditionsPage from './pages/term-and-conditions';
import PrivacyPolicyPage from './pages/privacy-policy';
import SponsorsPage from './pages/sponsors';
import LabPage from './pages/lab/page';
import MetadataPage from './pages/metadata/page';
import DesktopLayout from './components/desktop-layout';
import MobileNotSupportedPage from './pages/mobile-not-supported';

const Router = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isMobile ? (
              <MobileNotSupportedPage />
            ) : (
              <DesktopLayout />
            )
          }
        />
        <Route path="/privacy_policy.html" element={<PrivacyPolicyPage />} />
        <Route path="/term_and_conditions.html" element={<TermAndConditionsPage />} />
        <Route path="/sponsors" element={<SponsorsPage />} />
        <Route path="/lab" element={<LabPage />} />
        <Route path="/metadata" element={<MetadataPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
