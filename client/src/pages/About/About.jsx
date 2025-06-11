import React from 'react';
import SectionTitle from '../../components/Shared/SectionTitle/SectionTitle';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const About = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionTitle 
        title="About Recipe Book" 
        subtitle="Learn more about our mission, vision, and the team behind Recipe Book" 
      />
      
      <motion.div 
        className="max-w-4xl mx-auto space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Our Story */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="relative h-64 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1500&q=80" 
                alt="Cooking together" 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <h2 className="text-3xl font-bold text-white p-6">Our Story</h2>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-lg mb-4">
                Recipe Book was founded in 2023 with a simple mission: to make cooking accessible, enjoyable, and social for everyone. What started as a small project among friends has grown into a vibrant community of food enthusiasts sharing their culinary creations and discoveries.
              </p>
              <p className="text-lg">
                We believe that food brings people together, transcends cultural boundaries, and creates lasting memories. Our platform is designed to celebrate this universal language of food by providing tools that make recipe creation, sharing, and discovery a delightful experience.
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Our Mission */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-primary">Our Mission</h2>
              <p className="text-lg mb-6">
                To empower home cooks and food enthusiasts with innovative tools and a supportive community that celebrates culinary creativity and makes cooking an accessible joy for everyone.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Community</h3>
                  <p>Building a supportive network of food lovers who inspire each other</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Education</h3>
                  <p>Sharing culinary knowledge and techniques for cooks of all levels</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                  <p>Creating tools that make cooking more accessible, efficient, and enjoyable</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Our Team */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-primary">Meet Our Team</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    name: "Alex Johnson",
                    role: "Founder & CEO",
                    bio: "Former chef with a passion for making cooking accessible to everyone.",
                    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                  },
                  {
                    name: "Samantha Lee",
                    role: "Head of Content",
                    bio: "Food writer and recipe developer with a knack for storytelling through food.",
                    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                  },
                  {
                    name: "Marcus Chen",
                    role: "CTO",
                    bio: "Tech enthusiast who believes in the power of technology to transform cooking.",
                    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                  }
                ].map((member, index) => (
                  <div key={index} className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-primary font-medium mb-2">{member.role}</p>
                    <p className="text-gray-600 dark:text-gray-400">{member.bio}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Join Us */}
        <motion.div variants={itemVariants} className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Join Our Culinary Community</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Whether you're a seasoned chef or just starting your cooking journey, there's a place for you in our community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/register">Sign Up Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default About;