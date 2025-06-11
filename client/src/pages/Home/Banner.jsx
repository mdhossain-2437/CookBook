import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { FaSearch, FaArrowRight } from "react-icons/fa";
import { Tooltip } from "react-tooltip";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Banner = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)" },
    tap: { scale: 0.95 },
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  const backgroundImages = [
    "https://images.unsplash.com/photo-1606787366850-de6330128bfc",
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
  ];

  return (
    <div className="relative">
      {/* Hero Banner with Background Slider */}
      <div className="relative h-[80vh] overflow-hidden">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={backgroundImages.length > 1}
          className="absolute inset-0 w-full h-full"
        >
          {backgroundImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${image})`,
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-60"></div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div 
            className="container mx-auto px-4 text-center text-white"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 font-serif leading-tight"
              variants={itemVariants}
            >
              Discover & Share <br />
              <span className="text-primary">
                <Typewriter
                  words={["Delicious Recipes", "Cooking Tips", "Culinary Adventures"]}
                  loop
                  cursor
                  cursorStyle="_"
                  typeSpeed={70}
                  deleteSpeed={50}
                  delaySpeed={1000}
                />
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-200"
              variants={itemVariants}
            >
              Join our community of food enthusiasts to discover, create, and share amazing recipes from around the world.
            </motion.p>
            
            <motion.form 
              onSubmit={handleSearch} 
              className="flex max-w-md mx-auto mb-8"
              variants={itemVariants}
            >
              <input
                type="text"
                placeholder="Search for recipes..."
                className="flex-grow px-4 py-3 rounded-l-lg focus:outline-none text-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-tooltip-id="search-tooltip"
                data-tooltip-content="Type a recipe name, ingredient, or cuisine"
              />
              <motion.button
                type="submit"
                className="bg-primary hover:bg-primary-dark px-6 py-3 rounded-r-lg flex items-center justify-center"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                data-tooltip-id="search-button-tooltip"
                data-tooltip-content="Search recipes"
              >
                <FaSearch />
              </motion.button>
            </motion.form>
            
            <motion.div className="flex flex-wrap justify-center gap-4" variants={itemVariants}>
              <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                <Link
                  to="/all-recipes"
                  className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300 inline-flex items-center gap-2 group"
                  data-tooltip-id="browse-tooltip"
                  data-tooltip-content="Browse our collection"
                >
                  <span>Browse Recipes</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>
              
              <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                <Link
                  to="/add-recipe"
                  className="bg-white text-primary hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-300 inline-block"
                  data-tooltip-id="add-tooltip"
                  data-tooltip-content="Share your own recipe"
                >
                  Add Your Recipe
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Tooltips */}
      <Tooltip id="search-tooltip" />
      <Tooltip id="search-button-tooltip" />
      <Tooltip id="browse-tooltip" />
      <Tooltip id="add-tooltip" />
    </div>
  );
};

export default Banner;