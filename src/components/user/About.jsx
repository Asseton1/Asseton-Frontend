import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserGroupIcon, 
  HomeModernIcon, 
  TrophyIcon,
  CheckBadgeIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ChartBarIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Header from '../shared/Header';
import Footer from '../shared/Footer';

function About() {
  const [activeFaq, setActiveFaq] = useState(0);

  // Team members data
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      position: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      bio: 'With over 15 years in real estate, Sarah leads our vision for connecting people with their dream properties.'
    },
    {
      name: 'Michael Chen',
      position: 'Chief Property Officer',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      bio: 'Michaels expertise in property valuation and market analysis ensures our listings meet the highest standards.'
    },
    {
      name: 'Priya Patel',
      position: 'Head of Customer Relations',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      bio: 'Priyas dedication to client satisfaction has helped thousands of families find their perfect homes.'
    },
    {
      name: 'David Rodriguez',
      position: 'Senior Property Consultant',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      bio: 'With a background in architecture, David brings unique insights to help clients visualize their future homes.'
    }
  ];

  // Values/features
  const values = [
    {
      title: 'Property Marketing',
      description: 'We showcase your property with professional photography and smart compaigns, reaching the rightbuyers or tenants to maximize visibility, value and speed.',
      icon: <CheckBadgeIcon className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Property Management',
      description: 'Your property is your dream, your sacrifice, and your pride. If you are abroad or too busy, Asseton becomes your trusted family, managing your house, apartment, land, business space, office, or shop with care. We provide management services across all of Kerala. Our staff personally escorts clients, shows your property, and keeps it safe until it reaches the right hands',
      icon: <HomeModernIcon className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Documentation Support',
      description: 'Our experts manage title checks, sale deeds agreements, and registrations with precesion ensuring every transaction is smooth, transparent and secure.',
      icon: <GlobeAltIcon className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Loan Assistance',
      description: 'We connect you with top banks and institutions , guiding you through approvals and securing the best interest rates and terms with ease.',
      icon: <ChartBarIcon className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Property Survey',
      description: 'Accurate surveys verify boundaries, area and complience-providing clarity for valuation, construction or dispute resolution with complete confidence.',
      icon: <HeartIcon className="h-6 w-6 text-green-600" />
    },
    {
      title: 'The Real Asset is Here',
      description: 'The mainproblem faced by the people today is the inability to sell or buy properties due to commission and brocker fee. Asserton is a best solution for that. Asserton is a platform for selling, buying, rent and lease properties without brockers or intermediaries.',
      icon: <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
    }
  ];

  const faqItems = [
    {
      question: "How do I start my property search?",
      answer: "You can begin by browsing our property listings online, using filters to narrow down your search based on location, price, property type, and amenities. Alternatively, you can contact our team directly for personalized assistance."
    },
    {
      question: "What areas do you cover?",
      answer: "We currently operate in over 50 cities nationwide, with a strong presence in major metropolitan areas and growing coverage in suburban and rural communities."
    },
    {
      question: "How do you ensure property quality?",
      answer: "Every property listed on our platform undergoes a thorough verification process. Our team inspects properties, verifies ownership documents, and ensures all listings meet our quality standards before they're published."
    },
    {
      question: "Do you help with financing options?",
      answer: "Yes, we partner with several financial institutions to offer competitive mortgage rates and financing solutions. Our team can connect you with the right financial advisors based on your needs."
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section - Modern Glassmorphism Banner */}
      <section className="relative overflow-hidden bg-slate-950">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center scale-110 md:scale-100"
          aria-hidden="true"
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-slate-950/95"></div>
        <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-1/2 translate-x-32 bg-gradient-to-l from-emerald-500/20 via-transparent to-transparent blur-2xl md:block"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent"></div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="relative mx-auto flex min-h-[80vh] w-full max-w-7xl flex-col justify-center px-4 pb-20 pt-32 sm:px-6 lg:px-8 lg:pt-36"
        >
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:flex md:items-center md:justify-center"
          >
            <div className="max-w-3xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                Experience Asseton
              </div>
              <h1 className="heading-1 mt-6 text-white">
                Creating transparent real estate journeys built on trust
              </h1>
              <p className="body-large mt-6 max-w-2xl text-slate-100/80 leading-relaxed">
                We combine human expertise with intelligent data to help you discover, manage, and elevate every property decision with confidence.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a 
                  href="/property-listing" 
                  className="btn-primary bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-300"
                >
                  Browse Featured Homes
                </a>
                <a 
                  href="/contact" 
                  className="btn-secondary border-white/40 text-white hover:bg-white/10"
                >
                  Talk to an Advisor
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Our Story Section - With Floating Elements */}
      <div className="max-w-7xl mx-auto container-padding section-padding relative">
        <div className="absolute top-0 right-0 -mt-20 w-64 h-64 bg-green-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 w-80 h-80 bg-green-100 rounded-full opacity-20 blur-3xl"></div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="responsive-flex-row gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="responsive-w-half"
            >
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-green-100 rounded-lg z-0"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-green-100 rounded-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-2xl shadow-2xl">
                  <img 
                    src="https://img.freepik.com/premium-photo/house-future-is-designed-by-architect_1204564-4887.jpg?uid=R175609030&ga=GA1.1.2035126144.1745896858&semt=ais_hybrid&w=740" 
                    alt="Modern futuristic house" 
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="responsive-w-half"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <SparklesIcon className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="heading-2 text-gray-900">Our Story</h2>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="body-medium text-gray-600 mb-6 leading-relaxed">
                  Since 2010, with 15 years of experience in the real estate industry, we have managed, sold and rented out more than 300+ properties. Because of this, all our clients have been satisfied.
                </p>
                <p className="body-medium text-gray-600 mb-6 leading-relaxed">
                  In 2023, we started our preparations online, where instead of charging broker fees or commissions, we collected only a minimal service fee. With the help of professional staff, 
                  we ensured proper verification of documents on-site and successfully delivered properties to genuine clients, managing and closing deals effectively.
                </p>
                <p className="body-medium text-gray-600 leading-relaxed">
                  In 2025, to reach more people, we launched our website and mobile application. Our journey continues.
                </p>
              </div>
              
              <div className="mt-8">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Join Our Journey
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>


      {/* Our Values Section - Modern Grid */}
      <div id="services" className="max-w-7xl mx-auto container-padding section-padding">
        <div className="responsive-text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-2 text-gray-900 mb-4">Services We Offer</h2>
            <p className="body-medium text-gray-600 max-w-3xl mx-auto">
              Our commitment to excellence and client satisfaction drives everything we do
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mt-6"></div>
          </motion.div>
        </div>
        
        <div className="responsive-grid-3 responsive-gap">
          {values.map((value, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow duration-300 border-t-4 border-green-600"
            >
              <div className="p-3 bg-green-100 rounded-lg w-14 h-14 flex items-center justify-center mb-6">
                {value.icon}
              </div>
              <h3 className="heading-5 text-gray-900 mb-3">{value.title}</h3>
              <p className="body-small text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Awards & Recognition - Elegant Display */}
      <div className="max-w-7xl mx-auto container-padding section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="responsive-text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="heading-2 text-gray-900 mb-3 sm:mb-4">Awards & Recognition</h2>
          <p className="body-medium text-gray-600 max-w-3xl mx-auto px-4">
            Our commitment to excellence has been recognized throughout the industry
          </p>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mt-4 sm:mt-6"></div>
        </motion.div>
        
        <div className="responsive-grid-4 responsive-gap">
          {[
            { award: 'Best Property Platform', note: 'Over 1000+ satisfied clients and sold out properties', icon: <TrophyIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-yellow-500" /> },
            { award: 'Excellence in Customer Service', note: 'Save your time with a quick response for property sale or rent', icon: <UserGroupIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-yellow-500" /> },
            { award: 'Most Innovative Real Estate Company', note: 'Experienced proffesionals dedicated to perfect property', icon: <SparklesIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-yellow-500" /> },
            { award: 'Top Rated Property Marketplace', note: 'Clear transactions and secure process', icon: <BuildingOfficeIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-yellow-500" /> }
          ].map((award, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8 text-center border-t-4 border-yellow-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex justify-center mb-3 sm:mb-4">
                {award.icon}
              </div>
              <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{award.award}</p>
              <p className="text-xs sm:text-sm lg:text-base text-gray-500 leading-relaxed">{award.note}</p>
            </motion.div>
          ))}
        </div>
      </div>



      {/* Testimonials Section - Modern Carousel */}
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from the people who've found their dream properties with us
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mt-6"></div>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Emma Thompson",
              role: "Homeowner",
              image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
              quote: "Asseton made finding our family home an absolute joy. Their team was attentive to our needs and found us the perfect place within our budget."
            },
            {
              name: "James Wilson",
              role: "Property Investor",
              image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
              quote: "As an investor, I appreciate Asseton's market insights and professional approach. They've helped me build a profitable portfolio of properties."
            },
            {
              name: "Sophia Garcia",
              role: "First-time Buyer",
              image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
              quote: "Buying my first apartment was intimidating, but Asseton guided me through every step. I couldn't be happier with my new home!"
            }
          ].map((testimonial, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-8 relative"
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <div className="pt-4">
                <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-green-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div> */}


      {/* FAQ Section - Accordion Style */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our services
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mt-6"></div>
        </motion.div>
        
        <div className="space-y-6">
          {faqItems.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <motion.div 
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                layout
                className={`rounded-2xl border border-transparent bg-white overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-xl ring-1 ring-green-500/25' : 'shadow-md hover:shadow-lg'}`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/60"
                  aria-expanded={isOpen}
                  aria-controls={`about-faq-${index}`}
                >
                  <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      id={`about-faq-${index}`}
                      initial={{ height: 0, opacity: 0, y: -8 }}
                      animate={{ height: 'auto', opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
                      className="px-6 overflow-hidden"
                    >
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="pb-6 text-base leading-relaxed text-gray-600"
                      >
                        {faq.answer}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Final CTA with Background Image */}
      {/* CTA Section - Gradient Background */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Find Your Dream Property?</h2>
            <p className="text-xl text-green-100 mb-8">
              Let our expert team guide you through the process of finding the perfect home
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/property-listing" 
                className="bg-white text-green-700 hover:bg-green-50 px-8 py-3 rounded-lg font-medium transition-colors duration-300 shadow-lg"
              >
                Browse Properties
              </a>
              <a 
                href="/contact" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-medium transition-colors duration-300"
              >
                Contact Our Team
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default About;








