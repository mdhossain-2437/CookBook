import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest, FaYoutube } from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-white dark:bg-neutral-900 pt-16 pb-8 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl animate-pulse" style={{ animationDuration: '15s' }}></div>
        <div className="absolute -bottom-8 -left-16 w-72 h-72 rounded-full bg-secondary/5 dark:bg-secondary/10 blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>
      
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-90"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <Link to="/" className="flex items-center space-x-2 group mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="text-white font-bold text-xl relative z-10">R</span>
              </div>
              <span className="text-2xl font-serif font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Recipe</span>
                <span className="text-neutral-800 dark:text-white"> Book</span>
              </span>
            </Link>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Discover delicious recipes from around the world. Cook, share, and enjoy amazing food with friends and family.
            </p>
            <div className="flex space-x-3">
              <motion.a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaFacebook />
              </motion.a>
              <motion.a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTwitter />
              </motion.a>
              <motion.a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaInstagram />
              </motion.a>
              <motion.a 
                href="https://pinterest.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaPinterest />
              </motion.a>
              <motion.a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaYoutube />
              </motion.a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-neutral-800 dark:text-white relative inline-block">
              Quick Links
              <span className="absolute -bottom-1 left-0 w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></span>
            </h3>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/all-recipes", label: "All Recipes" },
                { to: "/cuisines", label: "Cuisines" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-300 flex items-center"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-neutral-800 dark:text-white relative inline-block">
              Categories
              <span className="absolute -bottom-1 left-0 w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></span>
            </h3>
            <ul className="space-y-2">
              {[
                { to: "/category/breakfast", label: "Breakfast" },
                { to: "/category/lunch", label: "Lunch" },
                { to: "/category/dinner", label: "Dinner" },
                { to: "/category/desserts", label: "Desserts" },
                { to: "/category/drinks", label: "Drinks" },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-neutral-800 dark:text-white relative inline-block">
              Contact Us
              <span className="absolute -bottom-1 left-0 w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span className="text-neutral-600 dark:text-neutral-400">
                  123 Recipe Street, Foodville, FC 12345
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span className="text-neutral-600 dark:text-neutral-400">
                  +1 (555) 123-4567
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span className="text-neutral-600 dark:text-neutral-400">
                  contact@recipebook.com
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent my-8"></div>
        
        {/* Copyright */}
        <div className="text-center text-neutral-600 dark:text-neutral-400 text-sm">
          <p>© {currentYear} Recipe Book. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link to="/privacy" className="hover:text-primary dark:hover:text-primary-light transition-colors duration-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary dark:hover:text-primary-light transition-colors duration-300">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-primary dark:hover:text-primary-light transition-colors duration-300">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;