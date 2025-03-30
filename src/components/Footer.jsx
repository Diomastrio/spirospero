import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className=" p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-800">
          <p className=" mb-4 md:mb-0">
            © 2025 Spiro Spero. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="./pages/about" className=" hover:text-white">
              About
            </Link>
            <Link to="/about" className=" hover:text-white">
              Privacy
            </Link>
            <Link to="/about" className=" hover:text-white">
              Terms
            </Link>
            <Link to="/about" className=" hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
