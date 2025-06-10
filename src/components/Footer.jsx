import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className=" p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-secondary">
          <p className=" mb-4 md:mb-0 text-primary">
            © 2025 Spiro Spero. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              to="/about"
              className="text-primary hover:bg-neutral rounded-md"
            >
              About
            </Link>
            <Link
              to="/about"
              className=" text-primary hover:bg-neutral rounded-md"
            >
              Privacy
            </Link>
            <Link
              to="/about"
              className=" text-primary hover:bg-neutral rounded-md"
            >
              Terms
            </Link>
            <Link
              to="/about"
              className=" text-primary hover:bg-neutral rounded-md"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
