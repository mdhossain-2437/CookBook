import React from "react";

const SectionTitle = ({ title, subtitle, centered = true, light = false }) => {
  return (
    <div className={`mb-12 ${centered ? "text-center" : ""}`}>
      <h2 
        className={`text-3xl md:text-4xl font-bold font-serif mb-4 ${light ? "text-white" : "text-gray-900 dark:text-white"}`}
      >
        {title}
      </h2>
      
      {subtitle && (
        <p 
          className={`text-lg ${light ? "text-white/80" : "text-gray-600 dark:text-gray-400"} max-w-2xl ${centered ? "mx-auto" : ""}`}
        >
          {subtitle}
        </p>
      )}
      
      <div className={`w-24 h-1 ${centered ? "mx-auto" : ""} mt-4 bg-primary rounded`}></div>
    </div>
  );
};

export default SectionTitle;