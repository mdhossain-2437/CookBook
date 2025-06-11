import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Fade, Slide, Zoom, JackInTheBox, AttentionSeeker } from "react-awesome-reveal";
import { Typewriter } from "react-simple-typewriter";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { FaUtensils, FaClock, FaUsers, FaGlobeAmericas, FaArrowRight, FaEnvelope } from "react-icons/fa";
import { MdFoodBank, MdOutlineRateReview } from "react-icons/md";
import { BiCategoryAlt } from "react-icons/bi";
import { Tooltip } from "react-tooltip";
import Lottie from "lottie-react";

// Import custom animation components
import ParticleBackground from "../../components/animations/ParticleBackground";
import FloatingElements from "../../components/animations/FloatingElements";
import AnimatedCounter from "../../components/animations/AnimatedCounter";
import GlowingButton from "../../components/animations/GlowingButton";
import MorphingCard from "../../components/animations/MorphingCard";

// Import API
import useAxiosPublic from "../../hooks/useAxiosPublic";

// Import components
import SectionTitle from "../../components/Shared/SectionTitle/SectionTitle";
import RecipeCard from "../../components/Recipe/RecipeCard";
import Banner from "./Banner";

// Import animations
import cookingAnimation from "../../assets/animations/cooking-animation.json";

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosPublic = useAxiosPublic();

  // Refs for scroll animations
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);
  const howItWorksRef = useRef(null);
  
  // Check if elements are in view
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });

  // Parallax effect for CTA section
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.8, 0.6]);

  // Fetch top recipes
  useEffect(() => {
    const fetchTopRecipes = async () => {
      try {
        const response = await axiosPublic.get("/recipes/top");
        // Ensure response.data is an array
        const recipesData = Array.isArray(response.data) ? response.data : [];
        setRecipes(recipesData);
        setFilteredRecipes(recipesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top recipes:", error);
        setRecipes([]);
        setFilteredRecipes([]);
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axiosPublic.get("/categories");
        // Ensure response.data is an array
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    fetchTopRecipes();
    fetchCategories();
  }, [axiosPublic]);

  // Filter recipes by category
  useEffect(() => {
    if (!Array.isArray(recipes)) {
      setFilteredRecipes([]);
      return;
    }
    
    if (selectedCategory === "all") {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter(
        (recipe) => recipe.category === selectedCategory
      );
      setFilteredRecipes(filtered);
    }
  }, [selectedCategory, recipes]);

  return (
    <div className="relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground 
        count={30} 
        colors={['#FF5A5F', '#3CAEA3', '#F8C630']} 
        minSize={3} 
        maxSize={8}
        speed={0.5}
        className="opacity-30 dark:opacity-20"
        dark={document.documentElement.getAttribute('data-theme') === 'dark'}
      />

      {/* Banner Section */}
      <Banner />

      {/* Top Recipes Section */}
      <section className="py-16 relative overflow-hidden">
        <FloatingElements 
          elements={[
            { type: 'circle', size: 60, color: 'primary', blur: 30 },
            { type: 'square', size: 80, color: 'secondary', blur: 40 },
            { type: 'triangle', size: 70, color: 'accent', blur: 35 },
          ]}
          className="opacity-20 dark:opacity-10"
          density={0.5}
        />
        
        <div className="container mx-auto px-4">
          <SectionTitle
            heading="Top Recipes"
            subheading="Explore our most popular and highly-rated recipes"
          />

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <motion.button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === "all" ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
              onClick={() => setSelectedCategory("all")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-tooltip-id="all-tooltip"
              data-tooltip-content="Show all recipes"
            >
              All
            </motion.button>

            {categories.map((category) => (
              <GlowingButton
                key={category._id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category.name ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                onClick={() => setSelectedCategory(category.name)}
                glowColor={selectedCategory === category.name ? "rgba(255, 90, 95, 0.6)" : "rgba(200, 200, 200, 0.4)"}
                glowSize={60}
                data-tooltip-id={`${category.name}-tooltip`}
                data-tooltip-content={`Show ${category.name} recipes`}
              >
                {category.name}
              </GlowingButton>
            ))}
          </div>

          {/* Tooltips */}
          <Tooltip id="all-tooltip" />
          {categories.map((category) => (
            <Tooltip key={category._id} id={`${category.name}-tooltip`} />
          ))}

          {/* Recipe Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredRecipes.map((recipe) => (
                <motion.div
                  key={recipe._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  layout
                >
                  <RecipeCard recipe={recipe} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <GlowingButton
              className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300 inline-flex items-center gap-2 group"
              glowColor="rgba(255, 90, 95, 0.6)"
              glowSize={100}
            >
              <Link to="/all-recipes" className="flex items-center gap-2">
                <span>View All Recipes</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </GlowingButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden" ref={featuresRef}>
        <div className="container mx-auto px-4 relative z-10">
          <Fade triggerOnce>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white font-serif">
                Why Choose <span className="text-primary">Recipe Book</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover the features that make our platform the perfect place for food enthusiasts
              </p>
            </div>
          </Fade>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 glass-card"
              initial={{ opacity: 0, y: 50 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-primary/10 dark:bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FaUtensils className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center text-gray-900 dark:text-white">
                Diverse Recipes
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Explore thousands of recipes from various cuisines around the world, from quick meals to gourmet dishes.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 glass-card"
              initial={{ opacity: 0, y: 50 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-primary/10 dark:bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <BiCategoryAlt className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center text-gray-900 dark:text-white">
                Easy Categorization
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Find exactly what you're looking for with our intuitive category system and powerful search filters.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 glass-card"
              initial={{ opacity: 0, y: 50 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-primary/10 dark:bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <MdOutlineRateReview className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center text-gray-900 dark:text-white">
                Community Reviews
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Read honest reviews and ratings from our community to find the perfect recipe for any occasion.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 relative overflow-hidden" ref={howItWorksRef}>
        <FloatingElements 
          elements={[
            { type: 'donut', size: 70, color: 'secondary', blur: 25 },
            { type: 'cross', size: 50, color: 'accent', blur: 20 },
          ]}
          className="opacity-20 dark:opacity-10"
          density={0.3}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <Fade triggerOnce>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white font-serif">
                How It <span className="text-primary">Works</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Follow these simple steps to get started with Recipe Book
              </p>
            </div>
          </Fade>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <JackInTheBox triggerOnce delay={300}>
              <MorphingCard
                frontContent={
                  <div className="text-center h-full flex flex-col items-center justify-center">
                    <div className="bg-primary/10 dark:bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                      <span className="text-primary text-2xl font-bold">1</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                      Create an Account
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Sign up for free and join our community of food enthusiasts
                    </p>
                    <div className="mt-4 text-primary font-medium">
                      Tap to learn more
                    </div>
                  </div>
                }
                backContent={
                  <div className="text-center h-full flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold mb-3 text-primary">
                      Benefits of Joining
                    </h3>
                    <ul className="text-left text-gray-600 dark:text-gray-300 space-y-2">
                      <li>• Save your favorite recipes</li>
                      <li>• Create your own recipe collection</li>
                      <li>• Rate and review recipes</li>
                      <li>• Connect with other food lovers</li>
                    </ul>
                    <Link to="/register" className="mt-4 text-primary font-medium underline">
                      Sign up now
                    </Link>
                  </div>
                }
                height="h-full min-h-[300px]"
              />
            </JackInTheBox>

            {/* Step 2 */}
            <JackInTheBox triggerOnce delay={600}>
              <MorphingCard
                frontContent={
                  <div className="text-center h-full flex flex-col items-center justify-center">
                    <div className="bg-primary/10 dark:bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                      <span className="text-primary text-2xl font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                      Explore Recipes
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Browse through our extensive collection of delicious recipes
                    </p>
                    <div className="mt-4 text-primary font-medium">
                      Tap to learn more
                    </div>
                  </div>
                }
                backContent={
                  <div className="text-center h-full flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold mb-3 text-primary">
                      Find Your Perfect Recipe
                    </h3>
                    <ul className="text-left text-gray-600 dark:text-gray-300 space-y-2">
                      <li>• Filter by category or cuisine</li>
                      <li>• Search by ingredients</li>
                      <li>• Sort by popularity or rating</li>
                      <li>• Discover seasonal favorites</li>
                    </ul>
                    <Link to="/all-recipes" className="mt-4 text-primary font-medium underline">
                      Browse recipes
                    </Link>
                  </div>
                }
                height="h-full min-h-[300px]"
              />
            </JackInTheBox>

            {/* Step 3 */}
            <JackInTheBox triggerOnce delay={900}>
              <MorphingCard
                frontContent={
                  <div className="text-center h-full flex flex-col items-center justify-center">
                    <div className="bg-primary/10 dark:bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                      <span className="text-primary text-2xl font-bold">3</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                      Share Your Creations
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Add your own recipes and share them with the community
                    </p>
                    <div className="mt-4 text-primary font-medium">
                      Tap to learn more
                    </div>
                  </div>
                }
                backContent={
                  <div className="text-center h-full flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold mb-3 text-primary">
                      Become a Recipe Creator
                    </h3>
                    <ul className="text-left text-gray-600 dark:text-gray-300 space-y-2">
                      <li>• Upload your original recipes</li>
                      <li>• Add photos of your dishes</li>
                      <li>• Receive feedback from users</li>
                      <li>• Build your culinary reputation</li>
                    </ul>
                    <Link to="/add-recipe" className="mt-4 text-primary font-medium underline">
                      Add a recipe
                    </Link>
                  </div>
                }
                height="h-full min-h-[300px]"
              />
            </JackInTheBox>
          </div>
        </div>
      </section>

      {/* Animation Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Fade direction="left" triggerOnce>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white font-serif">
                  Cooking Made <span className="text-primary">Simple</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Our platform simplifies the cooking process with detailed instructions and helpful tips for every recipe.
                </p>
              </Fade>
              
              <Slide direction="left" triggerOnce cascade damping={0.3}>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 dark:bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <MdFoodBank className="text-primary text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                        Easy-to-Follow Instructions
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Clear, step-by-step instructions make cooking a breeze, even for beginners.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 dark:bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FaClock className="text-primary text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                        Time-Saving Features
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Find recipes that fit your schedule with our cooking time filters and meal planning tools.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 dark:bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FaUsers className="text-primary text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                        Community Support
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Connect with other food enthusiasts, share tips, and get inspired by their creations.
                      </p>
                    </div>
                  </div>
                </div>
              </Slide>
            </div>
            
            <Fade direction="right" triggerOnce>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl transform rotate-3"></div>
                <div className="relative bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl">
                  <Lottie animationData={cookingAnimation} className="w-full h-auto" />
                </div>
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden" ref={statsRef}>
        <div className="container mx-auto px-4">
          <Fade triggerOnce>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white font-serif">
                Our <span className="text-primary">Numbers</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Join thousands of food enthusiasts in our growing community
              </p>
            </div>
          </Fade>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {/* Stat 1 */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 glass-card"
              initial={{ opacity: 0, y: 50 }}
              animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
            >
              <AttentionSeeker effect="pulse" delay={500} triggerOnce>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900 dark:text-white">
                  <AnimatedCounter from={0} to={5000} duration={2500} suffix="+" />
                </div>
                <div className="text-lg font-medium text-gray-600 dark:text-gray-300">Recipes</div>
              </AttentionSeeker>
            </motion.div>

            {/* Stat 2 */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 glass-card"
              initial={{ opacity: 0, y: 50 }}
              animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <AttentionSeeker effect="pulse" delay={700} triggerOnce>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900 dark:text-white">
                  <AnimatedCounter from={0} to={15000} duration={2500} suffix="+" />
                </div>
                <div className="text-lg font-medium text-gray-600 dark:text-gray-300">Users</div>
              </AttentionSeeker>
            </motion.div>

            {/* Stat 3 */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 glass-card"
              initial={{ opacity: 0, y: 50 }}
              animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <AttentionSeeker effect="pulse" delay={900} triggerOnce>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900 dark:text-white">
                  <AnimatedCounter from={0} to={100} duration={2500} suffix="+" />
                </div>
                <div className="text-lg font-medium text-gray-600 dark:text-gray-300">Cuisines</div>
              </AttentionSeeker>
            </motion.div>

            {/* Stat 4 */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 glass-card"
              initial={{ opacity: 0, y: 50 }}
              animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <AttentionSeeker effect="pulse" delay={1100} triggerOnce>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900 dark:text-white">
                  <AnimatedCounter from={0} to={50000} duration={2500} suffix="+" />
                </div>
                <div className="text-lg font-medium text-gray-600 dark:text-gray-300">Likes</div>
              </AttentionSeeker>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden" ref={ctaRef}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495195134817-aeb325a55b65?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1776&q=80')] bg-cover bg-center opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            style={{ scale, opacity }}
          >
            <Fade triggerOnce>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-serif gradient-text">
                Ready to start your culinary journey with{" "}
                <span className="text-primary">
                  <Typewriter
                    words={["Recipe Book?", "amazing flavors?", "new recipes?"]}
                    loop
                    cursor
                    cursorStyle="_"
                    typeSpeed={70}
                    deleteSpeed={50}
                    delaySpeed={1000}
                  />
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-10">
                Join thousands of food enthusiasts and start sharing your favorite recipes today.
              </p>
            </Fade>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              animate={ctaInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlowingButton
                className="bg-gradient-to-r from-primary to-primary-dark text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300 inline-flex items-center gap-2 group"
                glowColor="rgba(255, 90, 95, 0.7)"
                glowSize={120}
                hoverScale={1.05}
              >
                <Link to="/register" className="flex items-center gap-2" data-tooltip-id="signup-tooltip" data-tooltip-content="Create your free account">
                  <span>Sign Up Now</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </GlowingButton>
              
              <GlowingButton
                className="bg-white text-primary hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-300 inline-block"
                glowColor="rgba(255, 255, 255, 0.7)"
                glowSize={100}
                hoverScale={1.05}
              >
                <Link to="/all-recipes" data-tooltip-id="explore-tooltip" data-tooltip-content="Browse our recipe collection">
                  Explore Recipes
                </Link>
              </GlowingButton>
            </motion.div>
            <Tooltip id="signup-tooltip" />
            <Tooltip id="explore-tooltip" />
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Fade triggerOnce>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white font-serif gradient-text">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Get weekly recipe inspiration, cooking tips, and exclusive content delivered to your inbox.
              </p>
            </Fade>
            
            <Fade delay={300} triggerOnce>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="flex-grow relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm rounded-lg block w-full pl-10 p-3 border border-gray-300 dark:border-gray-700 focus:ring-primary focus:border-primary outline-none glass-card"
                    placeholder="Your email address"
                    required
                  />
                </div>
                <GlowingButton
                  type="submit"
                  className="bg-gradient-to-r from-primary to-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 inline-flex items-center justify-center"
                  glowColor="rgba(255, 90, 95, 0.6)"
                  glowSize={80}
                >
                  Subscribe
                </GlowingButton>
              </form>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                By subscribing, you agree to our Privacy Policy. You can unsubscribe at any time.
              </p>
            </Fade>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;