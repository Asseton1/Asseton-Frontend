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
              ASSETON Real Estate App — how we protect your information and the terms that govern our services.
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

        <div className="mb-12 text-gray-600 space-y-4">
          <p>
            <strong>Last updated:</strong> November 11, 2026
          </p>
          <p>
            ASSETON (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides a mobile application and website that help users
            browse property listings for sale, rent, and lease in India, and contact property advertisers
            through external channels such as phone, email, or WhatsApp.
          </p>
        </div>
        
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
            <div className="space-y-8">
              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">1. Scope</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    This Privacy Policy applies to the ASSETON Real Estate mobile app and related services
                    linked to{' '}
                    <a href="https://www.asseton.in" className="text-green-600 hover:underline">
                      https://www.asseton.in
                    </a>.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">2. No Accounts or Authentication</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    ASSETON does not require user registration, login, signup, or authentication.
                  </p>
                  <p>We do not create user accounts.</p>
                  <p>
                    We do not collect or store passwords, OTPs, profile credentials, or account information.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">3. Personal Information We Do NOT Collect</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    ASSETON does not collect personal details from users inside the app, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Date of birth</li>
                    <li>Government ID documents</li>
                    <li>Payment card or bank account details</li>
                    <li>Contacts from your phone book</li>
                    <li>Photos or media from your device gallery</li>
                    <li>Microphone or call recordings</li>
                  </ul>
                  <p>
                    If you choose to contact a property advertiser or ASSETON support, you do so through
                    external apps (Phone, Email, or WhatsApp). Any information you share there is handled
                    by those apps and the person/business you contact, not as an ASSETON user account.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Used to Provide the App</h3>
                <div className="text-gray-600 space-y-4">
                  <p>To show property listings, the app may use:</p>

                  <div>
                    <p className="font-medium text-gray-800 mb-2">a) Property listing data</p>
                    <p>
                      Property details, images, location names, prices, and advertiser contact details
                      are loaded from ASSETON&apos;s servers so you can browse listings.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-800 mb-2">b) Search and filter preferences</p>
                    <p>
                      Search text and filters you select (for example property type, price range, bedrooms,
                      bathrooms, area, buy/rent) may be sent to our servers to return matching listings.
                      Some filter preferences may be saved only on your device for convenience.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-800 mb-2">c) Optional device location</p>
                    <p>
                      If you choose &quot;use current location&quot; (or similar), the app may access your device
                      location with your permission and send approximate latitude/longitude to our servers
                      to show nearby properties. Location access is optional. You can deny or turn off
                      location permission in your device settings. We do not use location for advertising
                      profiles or sell location data.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-800 mb-2">d) Technical connection data</p>
                    <p>
                      Standard technical data needed to deliver the app (such as internet connectivity
                      status and requests to our servers) may be processed automatically by the device,
                      OS, and hosting infrastructure.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">5. How We Use Information</h3>
                <div className="text-gray-600 space-y-4">
                  <p>We use the limited information described above only to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Display and search property listings</li>
                    <li>Improve listing relevance (for example nearby results when location is enabled)</li>
                    <li>Operate and maintain the app and website</li>
                    <li>Respond when you contact us through phone, email, or WhatsApp</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">6. Information Sharing</h3>
                <div className="text-gray-600 space-y-4">
                  <p>We do not sell personal information.</p>
                  <p>
                    We do not share user account profiles (because we do not create accounts).
                  </p>
                  <p>
                    Listing content and advertiser contact details shown in the app come from ASSETON&apos;s
                    property database and may be publicly visible in the app for legitimate real-estate
                    enquiry purposes.
                  </p>
                  <p>
                    Service providers that host our website/API may process technical request data solely
                    to operate the service.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">7. Third-Party Services / External Apps</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    The app may open external services when you tap certain actions, for example:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Phone dialer</li>
                    <li>Email app</li>
                    <li>WhatsApp</li>
                    <li>Maps or video links related to a listing</li>
                    <li>Our Privacy Policy / Terms page in a browser or in-app web view</li>
                  </ul>
                  <p>
                    Those third parties have their own privacy practices. ASSETON is not responsible for
                    data you share directly with them.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Security</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    We take reasonable technical and organisational measures to protect our systems. No
                    method of transmission over the internet is completely secure.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    The app is intended for general property browsing and is not directed at children. We
                    do not knowingly collect personal information from children.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">10. Your Choices</h3>
                <div className="text-gray-600 space-y-4">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You can use the app without creating an account (none are required).</li>
                    <li>You can refuse location permission.</li>
                    <li>You can clear app data / uninstall the app at any time.</li>
                    <li>You can contact us using the details below for privacy questions.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h3>
                <div className="text-gray-600 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Email:</strong> asseton@asseton.in</p>
                    <p><strong>Phone:</strong> +91 952661555</p>
                    <p><strong>Address:</strong> Vattoly Annexe, 2nd Floor, SRM Road, Cochin 682018, Kerala, India</p>
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
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h2>
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-800 font-semibold">
                  PLEASE READ THESE TERMS BEFORE USING THE ASSETON APP OR WEBSITE.
                </p>
              </div>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    By using the ASSETON Real Estate app or website, you agree to these Terms of Service.
                    If you do not agree, please stop using the service.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">2. About ASSETON</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    ASSETON is a platform that displays property listings for sale, rent, and lease and
                    helps users discover properties and contact advertisers. ASSETON is provided for
                    advertising and information purposes.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">3. No User Accounts</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    You can browse listings without registration or login. ASSETON does not provide
                    authenticated user accounts in the app.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">4. Services</h3>
                <div className="text-gray-600 space-y-4">
                  <p>The app/website may allow you to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>a) Browse property listings (Buy / Rent / related categories)</li>
                    <li>b) Search and filter listings</li>
                    <li>c) Optionally use device location to view nearby listings</li>
                    <li>d) View property details, images, and related links</li>
                    <li>e) Contact advertisers or ASSETON through phone, email, or WhatsApp</li>
                    <li>f) Enquire about selling/listing a property through external contact channels</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">5. No Brokerage Guarantee / Independent Verification</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    ASSETON aims to help users connect with genuine buyers/sellers/advertisers and reduce
                    unnecessary brokerage friction. However:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Property details are provided for information/advertising purposes.</li>
                    <li>
                      You must independently verify ownership, title, approvals, measurements, pricing,
                      and condition before any transaction.
                    </li>
                    <li>
                      ASSETON does not take ownership of listed properties and does not guarantee
                      completion of any sale, rent, or lease.
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">6. Listings and Content</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    Advertisers/listing providers are responsible for the accuracy of property information
                    they supply. ASSETON may edit, remove, or refuse listings at its discretion. Do not
                    submit or promote unlawful, misleading, or unauthorised property content.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">7. User Conduct</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    You agree not to misuse the app, attempt unauthorised access to our systems, scrape
                    data abusively, or use listing contact details for spam or unlawful purposes.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">8. Payments</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    If any paid listing/advertising services are offered by ASSETON, payment terms will be
                    communicated at the time of purchase. Unless otherwise stated in writing, fees once
                    paid are non-refundable. ASSETON does not store your card details when payment is
                    processed through a third-party payment gateway.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Links and Apps</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    The service may contain links to maps, videos, WhatsApp, or other third-party tools.
                    ASSETON is not responsible for third-party content, availability, or practices.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">10. Disclaimer</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    The app and website are provided on an &quot;as available&quot; basis. ASSETON does not warrant
                    uninterrupted service or that all listing information is complete or error-free. To the
                    maximum extent permitted by law, ASSETON is not liable for losses arising from reliance
                    on listing information or from transactions between users and advertisers.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes</h3>
                <div className="text-gray-600 space-y-4">
                  <p>
                    We may update these Terms or the Privacy Policy from time to time. Continued use of the
                    app/website after updates means you accept the revised terms. The latest version will be
                    available at:{' '}
                    <a href="https://www.asseton.in/privacy-policy" className="text-green-600 hover:underline">
                      https://www.asseton.in/privacy-policy
                    </a>
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact</h3>
                <div className="text-gray-600 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Address:</strong> Vattoly Annexe, 2nd Floor, SRM Road, Cochin 682018, Kerala, India</p>
                    <p><strong>Phone:</strong> +91 952661555</p>
                    <p><strong>Email:</strong> asseton@asseton.in</p>
                  </div>
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
