
import React from 'react';
import { Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} WorkshopBase. All rights reserved.
            </p>
          </div>
          
          <div className="flex space-x-6 items-center">
            <a 
              href="https://ezyparts.burson.com.au" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-blue-700"
            >
              EzyParts
            </a>
            <a 
              href="https://bapcor.com.au" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-blue-700"
            >
              Bapcor
            </a>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/workshopbase" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-700"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com/workshopbase" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-700"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
