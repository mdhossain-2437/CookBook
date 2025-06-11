import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Fade } from "react-awesome-reveal";
import { FaSave, FaArrowLeft, FaCamera } from "react-icons/fa";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import SectionTitle from "../../components/Shared/SectionTitle/SectionTitle";
import Loader from "../../components/Shared/Loader/Loader";
import useAuth from "../../hooks/useAuth";

const EditProfile = () => {
  const { user, updateUserProfile, updateUserInDB } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: "",
    photoURL: "",
    bio: "",
    specialties: [],
    newSpecialty: "",
  });

  useEffect(() => {
    if (user) {
      // Initialize form with current user data
      setProfileData({
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        bio: user.bio || "",
        specialties: user.specialties || [],
        newSpecialty: "",
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleAddSpecialty = () => {
    if (profileData.newSpecialty.trim() && !profileData.specialties.includes(profileData.newSpecialty.trim())) {
      setProfileData({
        ...profileData,
        specialties: [...profileData.specialties, profileData.newSpecialty.trim()],
        newSpecialty: "",
      });
    }
  };

  const handleRemoveSpecialty = (specialty) => {
    setProfileData({
      ...profileData,
      specialties: profileData.specialties.filter((s) => s !== specialty),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update Firebase Auth profile
      await updateUserProfile({
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
      });

      // Update additional user data in database
      await updateUserInDB({
        name: profileData.displayName,
        photoURL: profileData.photoURL,
        bio: profileData.bio,
        specialties: profileData.specialties,
      });

      toast.success("Profile updated successfully!");
      navigate(`/profile/${user.uid}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Fade direction="up" triggerOnce>
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/profile/${user.uid}`)}
            className="mr-4"
          >
            <FaArrowLeft className="mr-2" /> Back to Profile
          </Button>
          <SectionTitle title="Edit Profile" subtitle="Update your profile information" />
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={profileData.photoURL || "https://via.placeholder.com/150?text=No+Image"}
                      alt={profileData.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0">
                    <label htmlFor="photoURL" className="cursor-pointer">
                      <div className="bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-colors">
                        <FaCamera />
                      </div>
                    </label>
                  </div>
                </div>
                <div className="mt-4 w-full max-w-md">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Profile Image URL
                  </label>
                  <input
                    type="text"
                    id="photoURL"
                    name="photoURL"
                    value={profileData.photoURL}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
                    placeholder="https://example.com/your-image.jpg"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
                  placeholder="Your name"
                />
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
                  placeholder="Tell us about yourself and your cooking style"
                ></textarea>
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cooking Specialties
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profileData.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {specialty}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(specialty)}
                        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        &times;
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    id="newSpecialty"
                    name="newSpecialty"
                    value={profileData.newSpecialty}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
                    placeholder="Add a specialty (e.g., Italian, Desserts)"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpecialty}
                    className="px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <FaSave />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Fade>
    </div>
  );
};

export default EditProfile;