import { createContext, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import app from "../firebase/firebase.config";
import { createOrUpdateUser, getUserByUid } from "../api/userApi";

export const AuthContext = createContext(null);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(null);
  
  // Session timeout duration in milliseconds (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  // Create user with email and password
  const createUser = async (email, password) => {
    setLoading(true);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result;
  };

  // Sign in with email and password
  const loginUser = async (email, password) => {
    setLoading(true);
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Get and store the token after successful login
    if (result.user) {
      const token = await result.user.getIdToken();
      localStorage.setItem('access-token', token);
      
      // Store basic user info
      localStorage.setItem('user', JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      }));
    }
    
    resetSessionTimeout();
    return result;
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoading(true);
    const result = await signInWithPopup(auth, googleProvider);
    
    // Get and store the token after successful Google login
    if (result.user) {
      const token = await result.user.getIdToken();
      localStorage.setItem('access-token', token);
      
      // Store basic user info
      localStorage.setItem('user', JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      }));
      
      // Save user to database after Google sign-in
      await createOrUpdateUser({
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      });
    }
    
    resetSessionTimeout();
    return result;
  };

  // Update user profile
  const updateUserProfile = async (profile) => {
    setLoading(true);
    await updateProfile(auth.currentUser, profile);
    setUser((prev) => ({ ...prev, ...profile }));
    resetSessionTimeout();
  };

  // Update user in database
  const updateUserInDB = async (userData) => {
    if (!auth.currentUser) return;
    
    const updatedUser = {
      uid: auth.currentUser.uid,
      ...userData
    };
    
    await createOrUpdateUser(updatedUser);
    resetSessionTimeout();
    return updatedUser;
  };

  // Reset password
  const resetPassword = async (email) => {
    return await sendPasswordResetEmail(auth, email);
  };

  // Sign out
  const logOut = async () => {
    setLoading(true);
    clearSessionTimeout();
    
    // Clear localStorage before signing out
    localStorage.removeItem('access-token');
    localStorage.removeItem('user');
    
    await signOut(auth);
  };

  // Reset session timeout
  const resetSessionTimeout = () => {
    clearSessionTimeout();
    
    const timeoutId = setTimeout(() => {
      // Auto sign out when session expires
      logOut();
      alert("Your session has expired. Please sign in again.");
    }, SESSION_TIMEOUT);
    
    setSessionTimeout(timeoutId);
  };

  // Clear session timeout
  const clearSessionTimeout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
  };

  // Observer for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Get the ID token
          const token = await currentUser.getIdToken();
          // Store token in localStorage
          localStorage.setItem('access-token', token);
          
          // Get additional user data from database
          const dbUser = await getUserByUid(currentUser.uid);
          
          // Merge auth user with database user data
          const mergedUser = {
            ...currentUser,
            ...dbUser?.data,
          };
          
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
          }));
          
          setUser(mergedUser);
          resetSessionTimeout();
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(currentUser);
        }
      } else {
        setUser(null);
        // Clear localStorage when user is logged out
        localStorage.removeItem('access-token');
        localStorage.removeItem('user');
      }
      
      setLoading(false);
    });

    return () => {
      clearSessionTimeout();
      unsubscribe();
    };
  }, []);

  const authInfo = {
    user,
    loading,
    createUser,
    loginUser,
    signInWithGoogle,
    updateUserProfile,
    updateUserInDB,
    resetPassword,
    logOut,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;