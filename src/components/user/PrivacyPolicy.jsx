import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../shared/Header';
import Footer from '../shared/Footer';

function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('privacy');

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 py-20">
        <div className="max-w-7xl mx-auto container-padding text-center pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="heading-1 text-white mb-6">
              Privacy Policy & Terms of Service
            </h1>
            <p className="body-medium text-green-100 max-w-3xl mx-auto">
              Your privacy and trust are important to us. Learn about how we protect your information and the terms that govern our services.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex space-x-8">
            <button
              onClick={() => scrollToSection('privacy')}
              className={`py-4 px-1 border-b-2 font-medium text-lg transition-colors ${
                activeSection === 'privacy'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => scrollToSection('terms')}
              className={`py-4 px-1 border-b-2 font-medium text-lg transition-colors ${
                activeSection === 'terms'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto container-padding section-padding">
        
        {/* Privacy Policy Section */}
        <motion.div
          id="privacy"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="heading-2 text-gray-900 mb-8">Privacy Policy</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <div className="space-y-8">
              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    We collect information you provide directly to us, such as when you create an account, 
                    search for properties, contact us, or subscribe to our newsletter. This may include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Name, email address, phone number, and other contact information</li>
                    <li>Property preferences and search criteria</li>
                    <li>Communication history with our team</li>
                    <li>Account credentials and profile information</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h3>
                <div className="text-gray-600 space-y-4">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send technical notices, updates, and support messages</li>
                    <li>Respond to your comments and questions</li>
                    <li>Communicate with you about products, services, and events</li>
                    <li>Monitor and analyze trends, usage, and activities</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    We do not sell, trade, or otherwise transfer your personal information to third parties 
                    without your consent, except in the following circumstances:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>With your explicit consent</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and safety</li>
                    <li>With trusted service providers who assist in operating our website</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    We implement appropriate security measures to protect your personal information against 
                    unauthorized access, alteration, disclosure, or destruction. However, no method of 
                    transmission over the internet is 100% secure.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h3>
                <div className="text-gray-600 space-y-4">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access and update your personal information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Request a copy of your data</li>
                    <li>Lodge a complaint with supervisory authorities</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Email:</strong> privacy@asseton.com</p>
                    <p><strong>Phone:</strong> +91 9744642436</p>
                    <p><strong>Address:</strong> 123 Property Street, Real Estate City, Kerala, India</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </motion.div>

        {/* Terms of Service Section */}
        <motion.div
          id="terms"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <div className="space-y-8">
              {/* Disclaimer Box */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-800 font-semibold">
                  PLEASE READ THE TERMS AND CONDITIONS BEFORE USING THIS WEBSITE
                </p>
              </div>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">INTRODUCTION</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    ASSETON is a platform for selling/buying/rent/lease properties without broker and commission. 
                    In this period, you can't buy/sell anything without a broker and brokerage. Here we offer a 
                    platform for those people who are suffering from the exploitation from brokers and we arrange 
                    genuine buyers/sellers for the people who want to handover their properties.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">1. ASSENT AND ACCEPTANCE</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    By using the website, you warrant that you have read and reviewed these terms and conditions 
                    and that you agree to bound by it. If you don't agree to be bound by these terms and conditions, 
                    please leave the site immediately. The owner only agrees to provide use of this website and 
                    services to you, if you assent to these terms and conditions. Further based on the services 
                    obtained by a user, additional terms and condition in respect of the specific service may apply, 
                    which shall be deemed an agreement between user and the owner(Asseton.com)
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">2. SERVICES</h3>
                <div className="text-gray-600 space-y-4">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>a. Posting user profile or listing for the purpose of sale/rental of properties and other property services etc.</li>
                    <li>b. Find property through Asseton.com and its internet links</li>
                    <li>c. Post advertisement on Asseton.com</li>
                  </ul>
                  <p>
                    These services can be purchased through various methods of payment offered
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">3. USER ACCOUNT AND REGISTRATION OBLIGATIONS</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                  The user can view certain information on the website without registering on the
website. However, certain other activities in the website including but not limited to
uploading information, posting comments etc. Require the user to register on the
website. The user shall be required to provide some personal information. When the
user creates a registered user account, including the user’s e-mail address, which is used
to provide the registered user’s account from unauthorized access. 
                  </p>
                  <p>
                  If a user uses the website, the user shall be responsible for maintaining the
confidentiality of the user’s ID and PASSWORD for restricting access to user’s computer
network. The user shall be responsible for all activities conducted under the user’s ID 
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">4. SUBMISSION AND ADMINISTRATION OF LISTING/ADVERTISEMENT</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                  Any user not agree to submit any property description, photography, financial
contract or other contained in each properties data to Asseton.com unless the user
submitting such a listing/advertisement has acquired received all necessary rights and
authorization from the owner of such property(s) on the user’s website or on
Asseton.com.
                  </p>
                  <p>
                  Similarly, Asseton.com doesn't take any ownership directly or indirectly
towards any person whatsoever, with respect to banners hosted on its website by its
customers, which are strictly in the nature of space by Asseton.com and it has not
carried out any Independent verification on the authenticity or compliance
requirements, as may have been required under any law for the time being in force, of
such images/banners/listings. Asseton shall have the right to modify property listing in
the exercise of its rights under these
                  </p>
                  <p>
                    Asseton retains the right to modify property listings as per its rights under these terms and conditions.
                  </p>
                  <p>You further agree:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li> To represent and warrant that all properties and associated information provided by
                    the user will be accurate</li>
                    <li> That the user will not be permit the posting of a property on Asseton.com under a
name or other than the name of a real estate agent, who has been duly authorized and
engaged by the owner of the property in this regard</li>
                  </ul>
                  <p>
                  Users who are buying/renting property through Asseton.com must verify details of
                  the property(s) as well as its right ownership, license etc. On their own
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">5. PAYMENT</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                  Payment for the service offered by Asseton.com shall be on advance basis, and there is
no installment allowed. The payment of service once paid by any is not refundable and
any amount paid stand appropriated. User acknowledges and agrees that Asseton.com,
at its sole discretion and without prejudice to other rights and remedies that it may have
under the applicable laws, shall be entitled to set off the amount paid or payable by a
customer/agent any amount(s) payable by a user to Asseton.com under any agreement
or commercial relationship towards other products/services.
                  </p>
                  <p>
                  Asseton.com undertakes no liabilities for free services. Asseton.com
reserve the right to amend/alter or change all or disclaimers or terms of agreement at
any time without any prior notice. All terms/disclaimers whether specifically mentioned
or not shall be deemed to be included if any reference is made to them. Asseton.com
offers the maximum care as is possible to ensure that all/any data/info in respect of
electronic transfer of money doesn’t fall in the wrong hands. For completing online
transactions involving payments as user is directed to a payment gateway. We don’t keep
any credit/debit card details. 
                  </p>
                  <p>
                  Asseton.com shall not be liable for any loss or damage sustained by reason
of any disclosure (inadvertent or otherwise) of any information concerning the user’s
account and/or information relating to or regarding online transactions using
credit/debit cards and/or verification process and particulars nor for any error, omission
or inaccuracy with respect to any information so disclosed and used whether not in
pursuance of a legal process or otherwise.

                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">6. THIRD PARTY LINKS AND CONTENT</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                  Asseton may occasionally post links to third party website or other services. You
agree that the Asseton.com is not responsible or liable for any loss or damage caused as
a result of your use of any third-party services linked to from our website

                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">7. MODIFICATION AND VARIATION</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                  Asseton.com may, from time to time at any time without notice to
you, modify these terms and conditions or revise anything contained herein In the event
that you fail to monitor any modifications or variations of these terms and conditions,
you agree that such failure shall be considered an affirmative wavier of your right to
review the modified agreement 
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">8. ENTIRE AGREEMENT</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                  This agreement shall constitute the complete and exclusive
agreement between the parties with respect to the matter, hereof suspending any prior
agreements, documents and or not communications regarding such subject matter
                  </p>
                  <p>
                  This website and service are provided for advertising purpose
only. You further agree that your purchase of any of the property(s) on the website is at
your own risk Asseton.com doesn’t assume responsibility or liability for any advice or
other information given on the website
                  </p>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Have Questions About Our Policies?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Our team is here to help clarify any questions you may have about our privacy policy or terms of service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="bg-white text-green-700 hover:bg-green-50 px-8 py-3 rounded-lg font-medium transition-colors duration-300 shadow-lg"
              >
                Contact Us
              </a>
              <a 
                href="/about" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-medium transition-colors duration-300"
              >
                Learn More About Us
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PrivacyPolicy;
