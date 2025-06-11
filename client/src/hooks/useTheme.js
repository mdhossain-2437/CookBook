import { useContext } from "react";
import { ThemeContext } from "../providers/ThemeProvider";

/**
 * Custom hook to access theme context
 * @returns {Object} Theme context with theme, isDarkMode, and toggleTheme
 */
const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default useTheme;