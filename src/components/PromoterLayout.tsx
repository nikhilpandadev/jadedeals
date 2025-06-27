import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import BoltNewBadge from './BoltNewBadge';
import HeaderPromoter from './HeaderPromoter';

const sidebarAndSearchRoutes = [
  '/promoter-dashboard',
  '/promoter-resources',
  '/followers-management'
  // add more as needed
];

const shouldShowSidebarAndSearch = (pathname: string) =>
  sidebarAndSearchRoutes.some(route =>
    route.endsWith('/') ? pathname.startsWith(route) : pathname === route
  );

const PromoterLayout = () => {
  const location = useLocation();
  const show = shouldShowSidebarAndSearch(location.pathname);
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderPromoter showSearchBar={show} />
      <div className="flex flex-1">
        {show && <Sidebar />}
        <main className="flex-1"><Outlet /></main>
      </div>
      <Footer />
      <BoltNewBadge 
        variant="auto"
        size="medium"
        position="bottom-right"
      />
    </div>
  );
};

export default PromoterLayout;
