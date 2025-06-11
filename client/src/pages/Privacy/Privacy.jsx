import React from 'react';
import SectionTitle from '../../components/Shared/SectionTitle/SectionTitle';
import { Card, CardContent } from '../../components/ui/card';
import { motion } from 'framer-motion';

const Privacy = () => {
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
        title="Privacy Policy" 
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
                  At Recipe Book, we respect your privacy and are committed to protecting your personal data. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                  you visit our website and use our services.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, 
                  please do not access the site or use our services.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Information We Collect</h2>
                
                <h3 className="text-xl font-semibold mb-2">Personal Data</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We may collect personal identification information from you in a variety of ways, including, but not limited to:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>When you register on our site</li>
                  <li>When you create or modify your account</li>
                  <li>When you post recipes or comments</li>
                  <li>When you subscribe to our newsletter</li>
                  <li>When you respond to a survey</li>
                  <li>When you fill out a form</li>
                  <li>When you contact us</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  The personal information we collect may include your name, email address, phone number, 
                  profile picture, and any other information you choose to provide.
                </p>
                
                <h3 className="text-xl font-semibold mt-4 mb-2">Non-Personal Data</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We may also collect non-personal identification information about users whenever they interact with our site. 
                  This may include:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Browser name</li>
                  <li>Type of computer or device</li>
                  <li>Technical information about users' means of connection to our site</li>
                  <li>Operating system</li>
                  <li>Internet service providers</li>
                  <li>Other similar information</li>
                </ul>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">How We Use Your Information</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We may use the information we collect from you for the following purposes:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>To personalize your experience and deliver content and product offerings relevant to your interests</li>
                  <li>To improve our website and services</li>
                  <li>To process transactions and manage your account</li>
                  <li>To send periodic emails, including newsletters, updates, and promotional content</li>
                  <li>To respond to your inquiries, comments, or questions</li>
                  <li>To provide customer support</li>
                  <li>To monitor and analyze usage patterns and trends</li>
                  <li>To protect our services, users, and others</li>
                  <li>To enforce our terms, conditions, and policies</li>
                </ul>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Cookies and Tracking Technologies</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We use cookies and similar tracking technologies to track activity on our site and store certain information. 
                  Cookies are files with a small amount of data which may include an anonymous unique identifier. 
                  Cookies are sent to your browser from a website and stored on your device.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                  However, if you do not accept cookies, you may not be able to use some portions of our site.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  We use cookies for the following purposes:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>To keep you signed in</li>
                  <li>To understand how you use our site</li>
                  <li>To remember your preferences</li>
                  <li>To ensure the website functions properly</li>
                  <li>To analyze the performance and usability of our services</li>
                  <li>To provide personalized content and recommendations</li>
                </ul>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Data Sharing and Disclosure</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We may share your personal information in the following situations:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf.</li>
                  <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.</li>
                  <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
                  <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so to comply with applicable law, governmental requests, judicial proceedings, court orders, or legal processes.</li>
                  <li><strong>To Protect Rights:</strong> We may disclose your information to protect the rights, property, or safety of Recipe Book, our users, or others.</li>
                </ul>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Data Security</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We implement appropriate technical and organizational measures to maintain the security of your personal data, 
                  including preventing unauthorized access, maintaining data accuracy, and ensuring the correct use of information.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure. 
                  While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Your Data Protection Rights</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Depending on your location, you may have the following rights regarding your personal data:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li><strong>Right to Access:</strong> You have the right to request copies of your personal data.</li>
                  <li><strong>Right to Rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
                  <li><strong>Right to Erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
                  <li><strong>Right to Restrict Processing:</strong> You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                  <li><strong>Right to Object to Processing:</strong> You have the right to object to our processing of your personal data, under certain conditions.</li>
                  <li><strong>Right to Data Portability:</strong> You have the right to request that we transfer the data we have collected to another organization, or directly to you, under certain conditions.</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  If you would like to exercise any of these rights, please contact us using the information provided in the "Contact Us" section.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Children's Privacy</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Our service is not directed to anyone under the age of 13. We do not knowingly collect personal information from children under 13. 
                  If we discover that a child under 13 has provided us with personal information, we will promptly delete such information from our servers.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  If you are a parent or guardian and you are aware that your child has provided us with personal information, 
                  please contact us so that we can take necessary actions.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Changes to This Privacy Policy</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
                  and updating the "Last updated" date at the top of this Privacy Policy.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Contact Us</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  If you have any questions about this Privacy Policy, please contact us:
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

export default Privacy;