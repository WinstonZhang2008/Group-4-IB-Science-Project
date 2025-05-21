import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import HomePage from './HomePage';
import SoilChecker from './SoilChecker';
import Visualizer from './Visualizer';

const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState<'home' | 'checker' | 'visualizer'>('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as 'home' | 'checker' | 'visualizer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900/10 to-amber-900/10">
      {/* Navigation Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 w-full border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Mars Agriculture Project</h1>
          <nav className="flex space-x-2">
            <Button 
              variant={currentPage === 'home' ? 'default' : 'outline'}
              onClick={() => handleNavigate('home')}
              size="sm"
            >
              Home
            </Button>
            <Button 
              variant={currentPage === 'checker' ? 'default' : 'outline'}
              onClick={() => handleNavigate('checker')}
              size="sm"
            >
              Soil Checker
            </Button>
            <Button 
              variant={currentPage === 'visualizer' ? 'default' : 'outline'}
              onClick={() => handleNavigate('visualizer')}
              size="sm"
            >
              Visualizer
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4 transition-all duration-300 ease-in-out">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'checker' && <SoilChecker />}
        {currentPage === 'visualizer' && <Visualizer />}
      </main>

      {/* Footer */}
      <footer className="bg-muted py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>IB Computer Science Project - Mars Agriculture Simulation</p>
          <p className="mt-2">Data based on current scientific understanding of Martian soil composition</p>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;