import React from 'react';
import SectionTitle from '../../components/Shared/SectionTitle/SectionTitle';
import { Card, CardContent } from '../../components/ui/card';
import { motion } from 'framer-motion';

const Terms = () => {
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
        title="Terms and Conditions" 
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
                  Welcome to Recipe Book. These Terms and Conditions govern your use of our website and services. 
                  By accessing or using our website, you agree to be bound by these Terms. If you disagree with any part of the terms, 
                  you may not access the website or use our services.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Definitions</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>"Service"</strong> refers to the Recipe Book website operated by Recipe Book Team.</li>
                  <li><strong>"User"</strong> refers to the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service.</li>
                  <li><strong>"Content"</strong> refers to recipes, images, text, graphics, videos, audio clips, and other material that may be viewed on, accessed through, or contributed to the Service.</li>
                  <li><strong>"Account"</strong> refers to a unique account created for You to access our Service or parts of our Service.</li>
                </ul>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">User Accounts</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
                  Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, 
                  whether your password is with our Service or a third-party service.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">User Content</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). 
                  You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  By posting Content on or through the Service, You represent and warrant that:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>The Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms.</li>
                  <li>The posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  We reserve the right to remove any Content from the Service at any time without notice, for any reason, including but not limited to, 
                  if we believe that such Content violates these Terms, infringes any intellectual property right or other right of any person or entity, 
                  threatens the personal safety of users of the Service or the public, or could create liability for Recipe Book.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Intellectual Property</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Recipe Book and its licensors. 
                  The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. 
                  Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Recipe Book.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  When you upload content, you grant Recipe Book a worldwide, non-exclusive, royalty-free license (with the right to sublicense) 
                  to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such content in any and all media or distribution methods (now known or later developed). 
                  This license authorizes us to make your content available to the rest of the world and to let others do the same.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Prohibited Uses</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>In any way that violates any applicable national or international law or regulation.</li>
                  <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
                  <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
                  <li>To impersonate or attempt to impersonate Recipe Book, a Recipe Book employee, another user, or any other person or entity.</li>
                  <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful.</li>
                  <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which may harm Recipe Book or users of the Service.</li>
                </ul>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Limitation of Liability</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  In no event shall Recipe Book, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, 
                  including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Your access to or use of or inability to access or use the Service;</li>
                  <li>Any conduct or content of any third party on the Service;</li>
                  <li>Any content obtained from the Service; and</li>
                  <li>Unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, 
                    whether or not we have been informed of the possibility of such damage.</li>
                </ul>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Disclaimer</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. 
                  The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, 
                  implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  Recipe Book, its subsidiaries, affiliates, and its licensors do not warrant that:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>The Service will function uninterrupted, secure or available at any particular time or location;</li>
                  <li>Any errors or defects will be corrected;</li>
                  <li>The Service is free of viruses or other harmful components; or</li>
                  <li>The results of using the Service will meet your requirements.</li>
                </ul>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Governing Law</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  These Terms shall be governed and construed in accordance with the laws of the United States, 
                  without regard to its conflict of law provisions.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. 
                  If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. 
                  These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Changes to Terms</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                  If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. 
                  What constitutes a material change will be determined at our sole discretion.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. 
                  If you do not agree to the new terms, please stop using the Service.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-primary mb-4">Contact Us</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  If you have any questions about these Terms, please contact us:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>By email: terms@recipebook.com</li>
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

export default Terms;