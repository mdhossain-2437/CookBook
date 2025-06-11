import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import useAuth from "../../../hooks/useAuth";
import { rateRecipe, getRecipeRatings } from "../../../api/recipeApi";

const RecipeRating = ({ recipeId }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [allRatings, setAllRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userHasRated, setUserHasRated] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch ratings when component mounts
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        // This would be replaced with a real API call
        // const data = await getRecipeRatings(recipeId);
        
        // Mock data for demonstration
        const mockRatings = [
          {
            id: "1",
            userId: "user1",
            userName: "John Doe",
            userAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
            rating: 5,
            review: "This recipe is amazing! The flavors blend perfectly and it's easy to make.",
            createdAt: "2023-05-15T10:30:00Z"
          },
          {
            id: "2",
            userId: "user2",
            userName: "Jane Smith",
            userAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
            rating: 4,
            review: "Very good recipe. I added some extra spices for more flavor.",
            createdAt: "2023-05-10T14:20:00Z"
          },
          {
            id: "3",
            userId: "user3",
            userName: "Mike Johnson",
            userAvatar: "https://randomuser.me/api/portraits/men/67.jpg",
            rating: 5,
            review: "Perfect! My family loved it.",
            createdAt: "2023-05-05T09:15:00Z"
          }
        ];
        
        setAllRatings(mockRatings);
        
        // Calculate average rating
        if (mockRatings.length > 0) {
          const total = mockRatings.reduce((sum, item) => sum + item.rating, 0);
          setAverageRating((total / mockRatings.length).toFixed(1));
        }
        
        // Check if current user has already rated
        if (user) {
          const userRating = mockRatings.find(r => r.userId === user.uid);
          if (userRating) {
            setUserHasRated(true);
            setUserRating(userRating);
            setRating(userRating.rating);
            setReview(userRating.review);
          }
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
        toast.error("Failed to load ratings");
      }
    };
    
    fetchRatings();
  }, [recipeId, user]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // This would be replaced with a real API call
      // const data = await rateRecipe(recipeId, { rating, review });
      
      // Mock response for demonstration
      const mockResponse = {
        id: "4",
        userId: user.uid,
        userName: user.displayName || "User",
        userAvatar: user.photoURL || "https://randomuser.me/api/portraits/lego/1.jpg",
        rating,
        review,
        createdAt: new Date().toISOString()
      };
      
      // Update state with new rating
      if (userHasRated) {
        // Update existing rating
        setAllRatings(allRatings.map(r => 
          r.userId === user.uid ? mockResponse : r
        ));
      } else {
        // Add new rating
        setAllRatings([mockResponse, ...allRatings]);
      }
      
      // Recalculate average
      const newTotal = allRatings.reduce((sum, item) => {
        if (item.userId === user.uid) return sum + rating;
        return sum + item.rating;
      }, 0);
      
      const newAvg = userHasRated 
        ? (newTotal / allRatings.length).toFixed(1)
        : ((newTotal + rating) / (allRatings.length + 1)).toFixed(1);
      
      setAverageRating(newAvg);
      setUserHasRated(true);
      setUserRating(mockResponse);
      setIsDialogOpen(false);
      toast.success(userHasRated ? "Rating updated successfully" : "Thank you for your rating!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">Ratings & Reviews</h3>
          <div className="flex items-center bg-primary/10 text-primary font-medium px-2 py-1 rounded-md">
            <FaStar className="text-yellow-500 mr-1" />
            <span>{averageRating}</span>
            <span className="text-sm text-gray-500 ml-1">({allRatings.length})</span>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FaStar className="text-yellow-500" />
              {userHasRated ? "Edit Your Rating" : "Rate This Recipe"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{userHasRated ? "Update Your Rating" : "Rate This Recipe"}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleRatingSubmit} className="space-y-4 mt-4">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <label key={index} className="cursor-pointer">
                      <input 
                        type="radio" 
                        name="rating" 
                        className="hidden" 
                        value={ratingValue} 
                        onClick={() => setRating(ratingValue)}
                      />
                      <FaStar 
                        className="w-8 h-8 mx-1 transition-colors" 
                        color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                      />
                    </label>
                  );
                })}
              </div>
              
              <Textarea
                placeholder="Share your experience with this recipe (optional)"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
              />
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Submitting..." : userHasRated ? "Update" : "Submit"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-6">
        {allRatings.length > 0 ? (
          allRatings.map((review) => (
            <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
              <div className="flex items-start gap-4">
                <img 
                  src={review.userAvatar} 
                  alt={review.userName} 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{review.userName}</h4>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, index) => (
                          <FaStar 
                            key={index} 
                            className="w-4 h-4" 
                            color={index < review.rating ? "#ffc107" : "#e4e5e9"} 
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-2">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {review.review && (
                    <p className="mt-2 text-gray-700 dark:text-gray-300">{review.review}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-8 text-gray-500">No reviews yet. Be the first to rate this recipe!</p>
        )}
      </div>
    </div>
  );
};

export default RecipeRating;