
import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-700">WorkshopBase</span>
          </Link>
          
          <nav className="hidden md:flex space-x-4">
            <Link 
              to="/ezyparts/dashboard" 
              className="text-gray-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              EzyParts Dashboard
            </Link>
            <Link 
              to="/ezyparts/search" 
              className="text-gray-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Vehicle Search
            </Link>
            <Link 
              to="/ezyparts/quote" 
              className="text-gray-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Current Quote
            </Link>
          </nav>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col space-y-4 pt-8">
                <Link 
                  to="/ezyparts/dashboard" 
                  className="text-gray-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  EzyParts Dashboard
                </Link>
                <Link 
                  to="/ezyparts/search" 
                  className="text-gray-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Vehicle Search
                </Link>
                <Link 
                  to="/ezyparts/quote" 
                  className="text-gray-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Current Quote
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="flex items-center">
          <Link 
            to="/ezyparts/config" 
            className="text-gray-600 hover:text-blue-700 p-2 rounded-full"
            title="EzyParts Configuration"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
