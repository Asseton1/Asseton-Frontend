import React from 'react';
import { motion } from 'framer-motion';
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

  // Company stats
  const stats = [
    { label: 'Properties Listed', value: '10,000+', icon: <HomeModernIcon className="h-8 w-8" /> },
    { label: 'Happy Clients', value: '5,000+', icon: <HeartIcon className="h-8 w-8" /> },
    { label: 'Years of Experience', value: '15+', icon: <ChartBarIcon className="h-8 w-8" /> },
    { label: 'Cities Covered', value: '50+', icon: <GlobeAltIcon className="h-8 w-8" /> }
  ];

  // Values/features
  const values = [
    {
      title: 'Trusted Expertise',
      description: 'Our team of certified real estate professionals brings decades of combined experience to every client interaction.',
      icon: <CheckBadgeIcon className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Premium Properties',
      description: 'We carefully curate our listings to ensure only the highest quality properties make it to our platform.',
      icon: <HomeModernIcon className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Global Reach',
      description: 'With connections across the country, we help clients find and sell properties in any market.',
      icon: <GlobeAltIcon className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Market Insights',
      description: 'Our data-driven approach provides clients with valuable insights to make informed real estate decisions.',
      icon: <ChartBarIcon className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Client-Centered',
      description: 'We prioritize your needs and preferences, ensuring a personalized experience throughout your property journey.',
      icon: <HeartIcon className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Commercial Expertise',
      description: 'Beyond residential properties, we excel in commercial real estate transactions and investments.',
      icon: <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section - Clean Premium Design */}
      <div className="relative h-[90vh] overflow-hidden bg-slate-900">
        {/* Background image with fixed positioning like in PropertyListing */}
        <div className="absolute inset-0 bg-fixed bg-center bg-cover" 
             style={{backgroundImage: 'url(https://victoriarealtors.in/wp-content/uploads/2023/05/shutterstock_2066280941-1024x576.jpg)'}}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between"
          >
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="md:w-1/2 text-center md:text-left mb-10 md:mb-0"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Redefining
                <span className="block text-white">
                  Real Estate
                </span>
                Excellence
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-xl leading-relaxed">
                Your journey to finding the perfect property begins with PropertyFinder's premium expertise.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                <a 
                  href="/property-listing" 
                  className="px-8 py-3 bg-white text-slate-900 rounded-md font-medium hover:bg-gray-100 transition-all shadow-lg"
                >
                  Explore Properties
                </a>
                <a 
                  href="/contact" 
                  className="px-8 py-3 bg-transparent text-white border border-white rounded-md font-medium hover:bg-white/10 transition-all"
                >
                  Contact Us
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Our Story Section - With Floating Elements */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        <div className="absolute top-0 right-0 -mt-20 w-64 h-64 bg-green-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 w-80 h-80 bg-green-100 rounded-full opacity-20 blur-3xl"></div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="md:w-1/2"
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
              className="md:w-1/2"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <SparklesIcon className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900">Our Story</h2>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Founded in 2008, PropertyFinder began with a simple mission: to transform how people find and purchase real estate. What started as a small team of passionate real estate professionals has grown into one of the region's most trusted property platforms.
                </p>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Our journey has been defined by innovation, integrity, and a deep understanding of both local and international property markets. We've helped thousands of families find their dream homes and assisted investors in making informed decisions about their property portfolios.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Today, PropertyFinder continues to lead the industry with cutting-edge technology, personalized service, and an unwavering commitment to connecting people with properties that meet their unique needs and aspirations.
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Sets Us Apart</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our commitment to excellence and client satisfaction drives everything we do
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mt-6"></div>
          </motion.div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Awards & Recognition - Elegant Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Awards & Recognition</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our commitment to excellence has been recognized throughout the industry
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mt-6"></div>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { year: '2023', award: 'Best Property Platform', icon: <TrophyIcon className="h-8 w-8 text-yellow-500" /> },
            { year: '2022', award: 'Excellence in Customer Service', icon: <UserGroupIcon className="h-8 w-8 text-yellow-500" /> },
            { year: '2021', award: 'Most Innovative Real Estate Company', icon: <SparklesIcon className="h-8 w-8 text-yellow-500" /> },
            { year: '2020', award: 'Top Rated Property Marketplace', icon: <BuildingOfficeIcon className="h-8 w-8 text-yellow-500" /> }
          ].map((award, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-md p-8 text-center border-t-4 border-yellow-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex justify-center mb-4">
                {award.icon}
              </div>
              <p className="text-gray-500 mb-2">{award.year}</p>
              <p className="text-lg font-semibold text-gray-900">{award.award}</p>
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
              quote: "PropertyFinder made finding our family home an absolute joy. Their team was attentive to our needs and found us the perfect place within our budget."
            },
            {
              name: "James Wilson",
              role: "Property Investor",
              image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
              quote: "As an investor, I appreciate PropertyFinder's market insights and professional approach. They've helped me build a profitable portfolio of properties."
            },
            {
              name: "Sophia Garcia",
              role: "First-time Buyer",
              image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
              quote: "Buying my first apartment was intimidating, but PropertyFinder guided me through every step. I couldn't be happier with my new home!"
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
          {[
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
          ].map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <details className="group">
                <summary className="flex justify-between items-center p-6 cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <span className="ml-6 flex-shrink-0 text-green-600 group-open:rotate-180 transition-transform duration-300">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  <p>{faq.answer}</p>
                </div>
              </details>
            </motion.div>
          ))}
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








