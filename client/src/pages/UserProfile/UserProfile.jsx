import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import { FaUser, FaUtensils, FaHeart, FaStar, FaUserFriends, FaEdit, FaTrophy, FaMedal } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import SectionTitle from "../../components/Shared/SectionTitle/SectionTitle";
import Loader from "../../components/Shared/Loader/Loader";
import RecipeCard from "../../components/Recipe/RecipeCard";
import useAuth from "../../hooks/useAuth";
import { getUserByUid, getUserRecipes, getLikedRecipes, followUser, unfollowUser } from "../../api/userApi";

const UserProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recipes");

  // Fetch user profile and related data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const userResponse = await getUserByUid(userId);
        if (userResponse?.data) {
          setProfile({
            id: userId,
            name: userResponse.data.name || "Anonymous User",
            bio: userResponse.data.bio || "No bio available",
            avatar: userResponse.data.photoURL || "https://via.placeholder.com/150?text=No+Image",
            specialties: userResponse.data.specialties || [],
            achievements: userResponse.data.achievements || [],
            rating: userResponse.data.rating || 0,
            recipeCount: userResponse.data.recipeCount || 0,
            followerCount: userResponse.data.followers?.length || 0,
            followingCount: userResponse.data.following?.length || 0,
            joinDate: new Date(userResponse.data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) || "Unknown",
            followers: userResponse.data.followers || [],
            following: userResponse.data.following || [],
          });
          
          // Check if current user is following this profile
          if (user && userResponse.data.followers) {
            setIsFollowing(userResponse.data.followers.includes(user.uid));
          }
          
          // Set followers and following arrays
          setFollowers(userResponse.data.followers || []);
          setFollowing(userResponse.data.following || []);
        }
        
        // Fetch user recipes
        const recipesResponse = await getUserRecipes(userId);
        if (recipesResponse?.data) {
          setRecipes(recipesResponse.data);
        }
        
        // Fetch liked recipes
        const likedResponse = await getLikedRecipes(userId);
        if (likedResponse?.data) {
          setLikedRecipes(likedResponse.data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchProfileData();
    }
  }, [userId, user]);

  const handleFollow = async () => {
    try {
      if (!user) {
        toast.error("Please login to follow users");
        return;
      }
      
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        setProfile(prev => ({
          ...prev,
          followerCount: Math.max(0, prev.followerCount - 1)
        }));
        toast.success("Unfollowed successfully");
      } else {
        await followUser(userId);
        setIsFollowing(true);
        setProfile(prev => ({
          ...prev,
          followerCount: prev.followerCount + 1
        }));
        toast.success("Following successfully");
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast.error("Failed to update follow status");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The user profile you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Fade cascade triggerOnce>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-10">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-primary to-purple-600">
            {/* Edit Profile Button (only visible to profile owner) */}
            {user && user.uid === userId && (
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                onClick={() => navigate("/edit-profile")}
              >
                <FaEdit className="mr-2" /> Edit Profile
              </Button>
            )}
          </div>
          
          {/* Profile Info */}
          <div className="px-6 py-4 flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 relative z-10">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden shadow-lg">
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Profile Details */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    {profile.name}
                    {profile.rating > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        <FaStar className="mr-1 text-yellow-500" /> {profile.rating.toFixed(1)}
                      </Badge>
                    )}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{profile.bio}</p>
                </div>
                
                {/* Follow Button (not visible to profile owner) */}
                {user && user.uid !== userId && (
                  <Button 
                    onClick={handleFollow}
                    variant={isFollowing ? "outline" : "default"}
                    className={isFollowing ? "border-primary text-primary" : ""}
                  >
                    <FaUserFriends className="mr-2" />
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <FaUtensils className="text-primary" />
                  <span className="font-medium">{profile.recipeCount}</span> Recipes
                </div>
                <div className="flex items-center gap-1">
                  <FaHeart className="text-red-500" />
                  <span className="font-medium">{profile.followerCount}</span> Followers
                </div>
                <div className="flex items-center gap-1">
                  <FaUserFriends className="text-blue-500" />
                  <span className="font-medium">{profile.followingCount}</span> Following
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Member since {profile.joinDate}
                </div>
              </div>
              
              {/* Specialties */}
              {profile.specialties && profile.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {profile.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">{specialty}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Achievements */}
          {profile.achievements && profile.achievements.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <FaTrophy className="text-yellow-500" /> Achievements
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.achievements.map((achievement, index) => (
                  <Badge key={index} className="bg-gradient-to-r from-yellow-400 to-yellow-600">
                    <FaMedal className="mr-1" /> {achievement}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="recipes" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="liked">Liked Recipes</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>
          
          {/* Recipes Tab */}
          <TabsContent value="recipes" className="mt-0">
            {activeTab === "recipes" && (
              <div>
                <SectionTitle 
                  title="Created Recipes" 
                  subtitle={`${profile.name}'s culinary creations`} 
                />
                
                {recipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {recipes.map((recipe) => (
                      <RecipeCard key={recipe._id} recipe={recipe} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-10 text-gray-500 dark:text-gray-400">
                    No recipes created yet.
                  </p>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* Liked Recipes Tab */}
          <TabsContent value="liked" className="mt-0">
            {activeTab === "liked" && (
              <div>
                <SectionTitle 
                  title="Liked Recipes" 
                  subtitle={`Recipes that ${profile.name} enjoys`} 
                />
                
                {likedRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {likedRecipes.map((recipe) => (
                      <RecipeCard key={recipe._id} recipe={recipe} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-10 text-gray-500 dark:text-gray-400">
                    No liked recipes yet.
                  </p>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* Network Tab */}
          <TabsContent value="network" className="mt-0">
            {activeTab === "network" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Followers */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FaHeart className="text-red-500" /> Followers
                    </h3>
                    
                    {followers.length > 0 ? (
                      <div className="space-y-4">
                        {followers.map((followerId) => (
                          <motion.div 
                            key={followerId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <FaUser className="text-gray-500 dark:text-gray-400" size={20} />
                            </div>
                            <div className="flex-1">
                              <Link to={`/profile/${followerId}`} className="font-medium hover:text-primary">
                                {followerId}
                              </Link>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/profile/${followerId}`)}>View Profile</Button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-6 text-gray-500 dark:text-gray-400">
                        No followers yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
                
                {/* Following */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FaUserFriends className="text-blue-500" /> Following
                    </h3>
                    
                    {following.length > 0 ? (
                      <div className="space-y-4">
                        {following.map((followingId) => (
                          <motion.div 
                            key={followingId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <FaUser className="text-gray-500 dark:text-gray-400" size={20} />
                            </div>
                            <div className="flex-1">
                              <Link to={`/profile/${followingId}`} className="font-medium hover:text-primary">
                                {followingId}
                              </Link>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/profile/${followingId}`)}>View Profile</Button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-6 text-gray-500 dark:text-gray-400">
                        Not following anyone yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Fade>
    </div>
  );
};

export default UserProfile;