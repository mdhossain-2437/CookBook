import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext(null);

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [isMounted, setIsMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    // Check if theme preference is stored in localStorage
    const storedTheme = localStorage.getItem("theme");
    
    if (storedTheme) {
      // Use stored preference
      setTheme(storedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }

    // Add transition class after initial theme is set
    const timeout = setTimeout(() => {
      document.documentElement.classList.add("transition-colors");
      setIsMounted(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  // Update data-theme attribute whenever theme changes
  useEffect(() => {
    if (isMounted) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme, isMounted]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "dark" ? "light" : "dark");
  };

  const themeInfo = {
    theme,
    isDarkMode: theme === "dark",
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={themeInfo}>{children}</ThemeContext.Provider>
  );
};

export default ThemeProvider;