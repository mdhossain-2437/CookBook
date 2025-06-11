import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import notFoundAnimation from "../../assets/animations/not-found.json";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-full max-w-sm mx-auto mb-8">
          <Lottie animationData={notFoundAnimation} loop={true} />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-serif">
          Oops! Page Not Found
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
          Looks like the recipe you're looking for has been moved or doesn't exist.
        </p>
        
        <Link 
          to="/"
          className="inline-block bg-primary hover:bg-primary-dark text-white font-medium rounded-lg px-6 py-3 transition-colors duration-300 shadow-md hover:shadow-lg"
        >
          Back to Home
        </Link>
      </div>
      
      <div className="mt-16 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Recipe Book. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default NotFound;