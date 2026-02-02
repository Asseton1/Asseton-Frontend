import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  ClockIcon,
  BuildingOfficeIcon,
  HomeModernIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import { propertyAPI } from '../../Services/api';

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    subject: 'Property Inquiry', // Default subject
    budget_range: '',
    message: ''
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone_number') {
      // Remove any non-digit characters except + (for international format)
      const formattedValue = value.replace(/[^\d+]/g, '');
      // Ensure + only appears at the start
      const sanitizedValue = formattedValue.replace(/\+/g, '').replace(/^/, '+');
      setFormData(prev => ({
        ...prev,
        phone_number: sanitizedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Submit the form with the current formData (no need to map phone anymore)
      await propertyAPI.submitContactForm(formData);
      
      setFormSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone_number: '',
        subject: 'Property Inquiry',
        budget_range: '',
        message: ''
      });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormSubmitted(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'An error occurred while submitting the form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const contactDetails = [
    {
      icon: MapPinIcon,
      title: 'Visit Our Studio',
      lines: ['123 Real Estate Plaza', 'Downtown District, NY 10001'],
      cta: { label: 'Open in Maps', href: 'https://maps.google.com' }
    },
    {
      icon: PhoneIcon,
      title: 'Call Our Advisors',
      lines: ['+1 (555) 123-REAL', '+1 (555) 123-HOME'],
      subtitle: 'Available 24/7 for priority clients'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Concierge Desk',
      lines: ['info@dreamhomes.com', 'sales@dreamhomes.com'],
      subtitle: 'Dedicated response within 24 hours'
    },
    {
      icon: ClockIcon,
      title: 'Consultation Hours',
      lines: ['Mon – Fri: 9AM – 7PM', 'Sat – Sun: 10AM – 5PM'],
      subtitle: 'Virtual appointments available'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      {/* Hero Section - Modern Premium Look */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover object-center"
            src="https://img.freepik.com/free-photo/luxurious-villa-with-modern-architectural-design_23-2151694016.jpg?uid=R175609030&ga=GA1.1.2035126144.1745896858&semt=ais_hybrid&w=1600"
            alt="Modern luxury waterfront villa at sunset"
            loading="eager"
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/65 to-slate-950/80" />
          <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-green-300/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center px-4 py-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center text-white"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100 backdrop-blur-md"
            >
              <StarIcon className="h-4 w-4 text-emerald-200" />
              Trusted Real Estate Partner
            </motion.span>

            <h1 className="mt-6 text-balance text-4xl font-bold sm:text-5xl md:text-6xl">
              Let&rsquo;s Connect &amp;
              <span className="block bg-gradient-to-r from-emerald-300 via-white to-emerald-200 bg-clip-text text-transparent">
                Discover Your Dream Home
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-gray-200 sm:text-xl">
              Work with award-winning advisors who combine market intelligence with concierge-level service for every stage of your property journey.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <motion.a
                href="#contact-form"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                Speak With An Expert
              </motion.a>
              <motion.a
                href="/property-listing"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-md transition hover:border-white/60 hover:bg-white/20"
              >
                <HomeModernIcon className="h-5 w-5 text-emerald-200" />
                Explore Properties
              </motion.a>
            </div>

            <div className="mt-12 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-left backdrop-blur-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/30">
                  <UserGroupIcon className="h-6 w-6 text-emerald-200" />
                </div>
                <div>
                  <p className="text-sm text-emerald-100/80">Clients Served</p>
                  <p className="text-lg font-semibold text-white">10,000+ Happy Buyers</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-left backdrop-blur-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/30">
                  <BuildingOfficeIcon className="h-6 w-6 text-emerald-200" />
                </div>
                <div>
                  <p className="text-sm text-emerald-100/80">Premium Portfolio</p>
                  <p className="text-lg font-semibold text-white">Luxury &amp; Smart Homes</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="grid lg:grid-cols-5 gap-0">
            {/* Contact Information - 2 columns */}
            <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-900 to-emerald-600 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12)_0,_rgba(255,255,255,0)_55%)]" />
              <div className="absolute -left-24 top-10 h-44 w-44 rounded-full bg-emerald-400/30 blur-3xl" />
              <div className="absolute right-6 bottom-6 h-36 w-36 rounded-full bg-emerald-200/20 blur-2xl" />

              <div className="relative z-10 flex h-full flex-col justify-between p-8 pb-10 sm:p-10 lg:p-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-10"
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100/90 backdrop-blur">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 text-emerald-200" />
                    Concierge Support
                  </div>
                  <h2 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl">Let’s collaborate on your next move</h2>
                  <p className="mt-4 max-w-md text-base text-emerald-100/90">
                    We're here to help you find your dream property. Reach out to our expert team through any of these channels.
                  </p>
                </motion.div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex-1 space-y-6"
                >
                  {contactDetails.map((detail, index) => (
                    <motion.div
                      key={detail.title}
                      variants={itemVariants}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="group flex items-start gap-4 rounded-2xl border border-white/15 bg-white/5 p-6 transition hover:border-white/25 hover:bg-white/10 backdrop-blur"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/25 text-emerald-100">
                        <detail.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{detail.title}</h3>
                        <div className="mt-2 space-y-1 text-sm text-emerald-50/90">
                          {detail.lines.map((line) => (
                            <p key={line}>{line}</p>
                          ))}
                        </div>
                        {detail.subtitle && (
                          <p className="mt-3 text-xs uppercase tracking-wide text-emerald-100/70">
                            {detail.subtitle}
                          </p>
                        )}
                        {detail.cta && (
                          <a
                            href={detail.cta.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center text-sm font-medium text-emerald-100 transition hover:text-white"
                          >
                            {detail.cta.label}
                            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6h8m0 0v8m0-8L6 18" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
            
            {/* Contact Form - 3 columns */}
            <div id="contact-form" className="lg:col-span-3 p-8 lg:p-12 mt-16 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
                <p className="text-gray-600 max-w-2xl">
                  Whether you're looking to buy, sell, or just have questions about real estate, 
                  our team is ready to assist you every step of the way.
                </p>
              </motion.div>
              
              {formSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h3>
                  <p className="text-gray-600">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <motion.form 
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-6 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-emerald-100/30 backdrop-blur sm:p-8"
                >
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-transparent bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 shadow-inner shadow-white/60 transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200/80"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-transparent bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 shadow-inner shadow-white/60 transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200/80"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-transparent bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 shadow-inner shadow-white/60 transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200/80"
                        placeholder="+1234567890"
                        pattern="^\+[0-9]+"
                        title="Please enter a valid phone number starting with + followed by numbers"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                        Property Interest
                      </label>
                      <select
                        id="propertyType"
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-transparent bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 shadow-inner shadow-white/60 transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200/80"
                        required
                      >
                        <option value="">Select property type</option>
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Industrial">Industrial</option>
                        <option value="Land">Land</option>
                        <option value="Investment">Investment Property</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="budget_range" className="block text-sm font-medium text-gray-700 mb-1">
                      Budget Range
                    </label>
                    <select
                      id="budget_range"
                      name="budget_range"
                      value={formData.budget_range}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-transparent bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 shadow-inner shadow-white/60 transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200/80"
                    >
                      <option value="">Select your budget</option>
                      <option value="₹5L - ₹10L">₹5L - ₹10L</option>
                      <option value="₹10L - ₹25L">₹10L - ₹25L</option>
                      <option value="₹25L - ₹50L">₹25L - ₹50L</option>
                      <option value="₹50L - ₹75L">₹50L - ₹75L</option>
                      <option value="₹75L - ₹1Cr">₹75L - ₹1Cr</option>
                      <option value="Above ₹1Cr">Above ₹1Cr</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full rounded-xl border border-transparent bg-slate-50 px-4 py-3 text-sm text-slate-800 shadow-inner shadow-white/60 transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200/80"
                      placeholder="Tell us about your dream property or any questions you have..."
                      required
                    ></textarea>
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-center rounded-2xl bg-emerald-500 py-4 px-8 text-lg font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:bg-emerald-400 hover:shadow-emerald-400/40 ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </motion.button>
                </motion.form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Map and Office Locations Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Locations</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Visit us at one of our premium office locations
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-emerald-600 mx-auto mt-6"></div>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden h-auto" // Changed from h-[400px] to h-auto
          >
            {/* Replace with actual map component or iframe */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215573862687!2d-73.98784492404045!3d40.75790937138799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1698764432324!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0, minHeight: "100%" }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location Map"
              className="w-full h-full"
            ></iframe>
          </motion.div>
          
          {/* Office Locations */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Offices</h3>
              
              <div className="space-y-8">
                {[
                  {
                    city: "New York",
                    address: "123 Real Estate Plaza, Downtown District, NY 10001",
                    phone: "+1 (555) 123-4567",
                    email: "newyork@dreamhomes.com"
                  },
                  {
                    city: "Los Angeles",
                    address: "456 Property Avenue, Beverly Hills, LA 90210",
                    phone: "+1 (555) 987-6543",
                    email: "la@dreamhomes.com"
                  },
                  {
                    city: "Miami",
                    address: "789 Coastal Drive, South Beach, Miami, FL 33139",
                    phone: "+1 (555) 456-7890",
                    email: "miami@dreamhomes.com"
                  }
                ].map((office, index) => (
                  <div key={index} className="flex gap-4 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{office.city}</h4>
                      <p className="text-gray-600 mb-2">{office.address}</p>
                      <div className="flex flex-col sm:flex-row sm:gap-4 text-sm">
                        <span className="flex items-center text-gray-600">
                          <PhoneIcon className="h-4 w-4 mr-1 text-green-500" />
                          {office.phone}
                        </span>
                        <span className="flex items-center text-gray-600">
                          <EnvelopeIcon className="h-4 w-4 mr-1 text-green-500" />
                          {office.email}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-emerald-600 mx-auto mt-6"></div>
          </motion.div>
          
          <div className="space-y-6">
            {[
              {
                question: "How do I schedule a property viewing?",
                answer: "You can schedule a property viewing by contacting us through this form, calling our office directly, or using the 'Request Viewing' button on any property listing page. Our team will get back to you within 24 hours to confirm your appointment."
              },
              {
                question: "What areas do you serve?",
                answer: "We currently operate in major metropolitan areas across the United States, with offices in New York, Los Angeles, and Miami. Our agents have extensive knowledge of these markets and surrounding suburbs."
              },
              {
                question: "Do you help with financing options?",
                answer: "Yes, we partner with several trusted financial institutions and can help you explore mortgage options, interest rates, and pre-approval processes. Our financial advisors can guide you through the entire process."
              },
              {
                question: "What documents do I need when buying a property?",
                answer: "When buying a property, you'll typically need proof of identity, proof of income (pay stubs, tax returns), bank statements, employment verification, and credit history. Our agents will provide a detailed checklist based on your specific situation."
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
      </div>
      
      {/* CTA Section */}
      <div className="relative py-20 overflow-hidden bg-gradient-to-r from-green-600 to-emerald-700">
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
              <motion.a 
                href="/property-listing" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-lg"
              >
                Browse Properties
              </motion.a>
              <motion.a 
                href="#contact-form" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Contact Us Now
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default ContactUs;














