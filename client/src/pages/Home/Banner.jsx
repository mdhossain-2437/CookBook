import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { FaSearch, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { getTopRecipes } from "../../api/recipeApi";
import { Tooltip } from "react-tooltip";
import { Fade } from "react-awesome-reveal";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Banner = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const data = await getTopRecipes();
        // Ensure data is an array before using slice
        setRecipes(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (error) {
        console.error("Error fetching featured recipes:", error);
        setRecipes([]);
        // Don't show error toast to users as this is not critical
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

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

      {/* Featured Recipes Carousel */}
      <div className="bg-white dark:bg-gray-800 py-16 relative z-20">
        <div className="container mx-auto px-4">
          <Fade triggerOnce>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 font-serif">Featured Recipes</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Explore our handpicked selection of the most popular recipes loved by our community
              </p>
            </div>
          </Fade>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="relative px-10">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                navigation={{
                  prevEl: ".swiper-button-prev",
                  nextEl: ".swiper-button-next",
                }}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={recipes.length > 1}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                  1280: { slidesPerView: 4 },
                }}
                className="featured-recipes-swiper"
              >
                <AnimatePresence>
                  {recipes.map((recipe) => (
                    <SwiperSlide key={recipe._id}>
                      <motion.div 
                        className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col"
                        whileHover={{ y: -8 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={recipe.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                            alt={recipe.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                          <div className="absolute top-3 right-3 bg-primary text-white text-xs font-medium px-2 py-1 rounded-full">
                            {recipe.cuisine}
                          </div>
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                            {recipe.title}
                          </h3>
                          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"></path>
                              </svg>
                              {recipe.preparationTime} mins
                            </span>
                            <span className="mx-2">•</span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path>
                              </svg>
                              {recipe.likes} likes
                            </span>
                          </div>
                          <div className="mt-auto">
                            <Link
                              to={`/recipe/${recipe._id}`}
                              className="text-primary hover:text-primary-dark font-medium inline-flex items-center gap-1 transition-colors duration-300"
                            >
                              View Recipe
                              <FaArrowRight className="text-xs" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    </SwiperSlide>
                  ))}
                </AnimatePresence>
              </Swiper>
              
              {/* Custom Navigation Buttons */}
              <button className="swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors duration-300">
                <FaArrowLeft />
              </button>
              <button className="swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors duration-300">
                <FaArrowRight />
              </button>
            </div>
          )}
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