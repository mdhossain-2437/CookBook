import React from "react";

const Loader = ({ size = "default" }) => {
  const sizeClasses = {
    small: "w-6 h-6 border-2",
    default: "w-10 h-10 border-4",
    large: "w-16 h-16 border-4",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default Loader;