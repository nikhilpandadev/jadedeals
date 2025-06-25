import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import BoltNewBadge from './BoltNewBadge';

const sidebarAndSearchRoutes = [
  '/dashboard',
  '/browse-deals',
  '/categories',
  '/saved-deals',
  '/deal/', // for detail pages
  '/profile',
  // add more as needed
];

const shouldShowSidebarAndSearch = (pathname: string) =>
  sidebarAndSearchRoutes.some(route =>
    route.endsWith('/') ? pathname.startsWith(route) : pathname === route
  );

const UserLayout = () => {
  const location = useLocation();
  const show = shouldShowSidebarAndSearch(location.pathname);
  return (
    <div className="min-h-screen flex flex-col">
      <Header showSearchBar={show} />
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

export default UserLayout;
