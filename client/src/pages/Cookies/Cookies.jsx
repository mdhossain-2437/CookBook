import React from 'react';
import SectionTitle from '../../components/Shared/SectionTitle/SectionTitle';
import { Card, CardContent } from '../../components/ui/card';
import { motion } from 'framer-motion';

const Cookies = () => {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <SectionTitle 
        title="Cookie Policy" 
        subtitle="Last updated: June 1, 2023" 
      />
      
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardContent className="p-6 md:p-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Introduction</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Recipe Book ("we", "our", or "us") uses cookies and similar technologies on our website. 
                  This Cookie Policy explains how we use cookies, how they help us provide you with a better browsing experience, 
                  and how you can manage your cookie preferences.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  By using our website, you consent to the use of cookies in accordance with this Cookie Policy. 
                  If you do not accept the use of cookies, please disable them as explained below so that cookies from this website cannot be placed on your device.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">What Are Cookies?</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Cookies are small text files that are stored on your computer or mobile device when you visit a website. 
                  They are widely used to make websites work more efficiently and provide information to the website owners. 
                  Cookies can be "persistent" or "session" cookies.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  Persistent cookies remain on your device for a set period of time or until you delete them, while session cookies 
                  are deleted once you close your web browser.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">How We Use Cookies</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We use different types of cookies for various purposes. These include:
                </p>
                
                <h3 className="text-xl font-semibold mt-4 mb-2">Essential Cookies</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  These cookies are necessary for the website to function properly. They enable basic functions like page navigation, 
                  secure areas access, and form submissions. The website cannot function properly without these cookies.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li><strong>Authentication cookies:</strong> To identify you when you log in to our website and to keep your session active.</li>
                  <li><strong>Security cookies:</strong> To enhance the security of our service and detect fraudulent activities.</li>
                  <li><strong>Load balancing cookies:</strong> To distribute the load of requests across multiple servers.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-4 mb-2">Preference Cookies</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  These cookies allow the website to remember choices you make (such as your username, language, or region) 
                  and provide enhanced, more personal features.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li><strong>Language preference cookies:</strong> To remember your preferred language settings.</li>
                  <li><strong>Theme preference cookies:</strong> To remember your preferred display settings (e.g., dark mode).</li>
                  <li><strong>Customization cookies:</strong> To remember your preferences for using our site.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-4 mb-2">Analytics Cookies</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  These cookies collect information about how visitors use our website, such as which pages they visit most often 
                  and if they receive error messages. This data helps us improve our website and your browsing experience.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li><strong>Google Analytics cookies:</strong> To collect data about website usage and user behavior.</li>
                  <li><strong>Performance cookies:</strong> To monitor site performance and how users interact with our content.</li>
                  <li><strong>Statistics cookies:</strong> To help us understand how visitors interact with our website by collecting and reporting information anonymously.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-4 mb-2">Marketing Cookies</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  These cookies track your browsing habits to deliver advertising more relevant to you and your interests. 
                  They are also used to limit the number of times you see an advertisement and to help measure the effectiveness of advertising campaigns.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li><strong>Advertising cookies:</strong> To deliver advertisements more relevant to you and your interests.</li>
                  <li><strong>Social media cookies:</strong> To enable you to share pages and content on social media platforms.</li>
                  <li><strong>Retargeting cookies:</strong> To show you relevant advertisements on other websites based on your previous interactions with our site.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-4 mb-2">Third-Party Cookies</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Some cookies are placed by third parties on our website. These third parties may include analytics providers, 
                  advertising networks, and social media platforms. These cookies enable these third parties to track and collect user data, 
                  which they may use for their own purposes, such as improving their own services or targeting advertisements.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Cookie Management</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse cookies, 
                  or to alert you when cookies are being sent. The methods for doing so vary from browser to browser, 
                  and from version to version.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  You can generally find how to manage cookies in the "Settings", "Preferences" or "Tools" menu of your browser. 
                  Here are links to instructions for some common browsers:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                  <li><a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  Please note that if you choose to block cookies, you may not be able to use all the features of our website.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Do Not Track Signals</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Some browsers have a "Do Not Track" feature that lets you tell websites that you do not want to have your online activities tracked. 
                  At this time, we do not respond to browser "Do Not Track" signals, but we do provide you the option to opt out of interest-based advertising 
                  by following the instructions in the "Cookie Management" section.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Updates to This Cookie Policy</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. 
                  Any changes will become effective when we post the revised Cookie Policy on our website. 
                  We encourage you to periodically review this page for the latest information on our cookie practices.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Contact Us</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>By email: privacy@recipebook.com</li>
                  <li>By phone: +1 (555) 123-4567</li>
                  <li>By mail: 123 Recipe Street, Foodville, FC 12345</li>
                </ul>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cookies;