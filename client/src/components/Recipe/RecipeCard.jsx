import { Link } from "react-router-dom";
import { FaHeart, FaRegClock, FaUtensils } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { motion } from "framer-motion";

import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const RecipeCard = ({ recipe }) => {
  const {
    _id,
    title,
    image,
    cuisineType,
    preparationTime,
    likeCount,
    categories,
  } = recipe;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-border/40">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={image || "https://via.placeholder.com/400x300?text=No+Image"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <Badge 
            variant="primary" 
            className="absolute top-2 left-2 z-10"
          >
            {cuisineType}
          </Badge>
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 z-10">
            <FaHeart className="text-red-500" />
            <span>{likeCount}</span>
          </div>
        </div>

        {/* Content */}
        <CardHeader className="p-4 pb-0">
          <h3 className="text-xl font-bold text-foreground line-clamp-2">
            {title}
          </h3>
        </CardHeader>

        <CardContent className="p-4 pt-2 flex-grow">
          <div className="flex items-center text-muted-foreground text-sm mb-4">
            <div 
              className="flex items-center mr-4" 
              data-tooltip-id={`prep-time-${_id}`} 
              data-tooltip-content="Preparation Time"
            >
              <FaRegClock className="mr-1" />
              <span>{preparationTime} mins</span>
            </div>
            <Tooltip id={`prep-time-${_id}`} />

            {categories && categories.length > 0 && (
              <div 
                className="flex items-center" 
                data-tooltip-id={`categories-${_id}`} 
                data-tooltip-content="Categories"
              >
                <FaUtensils className="mr-1" />
                <span className="truncate max-w-[120px]">
                  {categories.slice(0, 2).join(", ")}{categories.length > 2 ? "..." : ""}
                </span>
              </div>
            )}
            <Tooltip id={`categories-${_id}`} />
          </div>

          {/* Categories Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {categories && categories.slice(0, 3).map((category, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
              >
                {category}
              </Badge>
            ))}
            {categories && categories.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs"
              >
                +{categories.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>

        {/* Button */}
        <CardFooter className="p-4 pt-0 mt-auto">
          <Button asChild className="w-full">
            <Link to={`/recipe/${_id}`}>
              View Details
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RecipeCard;