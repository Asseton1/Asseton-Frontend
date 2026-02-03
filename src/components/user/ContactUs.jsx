import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [activeFaq, setActiveFaq] = useState(0);

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

  const faqItems = [
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
  ];

  const toggleFaq = (index) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      {/* Hero Section - Modern Contact Banner */}
      <section className="relative overflow-hidden bg-slate-950">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center"
          aria-hidden="true"
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/70 to-slate-950/95"></div>
        <div className="pointer-events-none absolute inset-x-0 top-1/4 h-64 bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent blur-2xl"></div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="relative mx-auto flex min-h-[70vh] w-full max-w-7xl flex-col justify-center px-4 pb-20 pt-32 sm:px-6 lg:px-8 lg:pt-36"
        >
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              Let's talk about your next property move
            </div>
            <h1 className="heading-1 mt-6 text-white">
              Connect with our real estate experts today
            </h1>
            <p className="body-large mt-6 text-slate-100/80 leading-relaxed">
              From first conversation to closing the deal, our dedicated team is on call to guide you with tailored insights, local expertise, and a transparent process every step of the way.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a 
                href="#contact-form" 
                className="btn-secondary border-white/40 text-white hover:bg-white/10 px-8 sm:px-10"
              >
                Start a Conversation
              </a>
              {/* <a 
                href="tel:+919526661555" 
                className="btn-secondary border-white/40 text-white hover:bg-white/10"
              >
                Call Our Team
              </a> */}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mx-auto mt-14 w-full max-w-4xl"
          >
            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-2xl sm:grid-cols-3 sm:gap-4 sm:p-6">
              {[
                {
                  title: 'Call us 24/7',
                  value: '+91 95266 61555',
                  icon: <PhoneIcon className="h-6 w-6" />,
                  href: 'tel:+919526661555'
                },
                {
                  title: 'Email support',
                  value: 'asseton@asseton.in',
                  icon: <EnvelopeIcon className="h-6 w-6" />,
                  href: 'mailto:asseton@asseton.in'
                },
                {
                  title: 'Visit our office',
                  value: 'Cochin • Kannur',
                  icon: <MapPinIcon className="h-6 w-6" />,
                  href: '#locations'
                }
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-2xl bg-white/5 p-4 transition-all duration-300 hover:bg-white/10 sm:gap-4 sm:p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200 sm:h-12 sm:w-12">
                    {React.cloneElement(item.icon, { className: 'h-5 w-5 sm:h-6 sm:w-6' })}
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200/80 sm:text-xs">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm font-medium text-white group-hover:text-emerald-100 sm:text-base">
                      {item.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto container-padding section-padding relative z-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="responsive-flex-col gap-0">
            {/* Contact Information - 2 columns */}
            <div className="lg:col-span-2 bg-gradient-to-br from-green-600 to-emerald-700 p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden">
              <div className="relative z-10 mt-8 sm:mt-12">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-8 sm:mb-12"
                >
                  <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-xl mb-6">
                    <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
                  <p className="text-green-100 max-w-md">
                    We're here to help you find your dream property. Reach out to our expert team through any of these channels.
                  </p>
                </motion.div>
                
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6 sm:space-y-8"
                >
                  <motion.div variants={itemVariants} className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
                      <MapPinIcon className="h-6 w-6 text-green-200" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-1">Vattoly Annexe</h3>
                      <p className="text-green-100">2nd Floor SRM Road</p>
                      <p className="text-green-100">Cochin 682018 Kerala, India</p>
                      <a 
                        href="https://maps.google.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-green-200 hover:text-white transition-colors"
                      >
                        View on map
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
                      <PhoneIcon className="h-6 w-6 text-green-200" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-1">Call Us</h3>
                      <p className="text-green-100">+91 9526661555</p>
                      <p className="text-green-100">+91 8590847916</p>
                      <p className="text-sm text-green-200 mt-1">Available 24/7 for urgent inquiries</p>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
                      <EnvelopeIcon className="h-6 w-6 text-green-200" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-1">Email Us</h3>
                      <p className="text-green-100">asseton@asseton.in</p>
                      <p className="text-green-100">asseton.in@gmail.com</p>
                      <p className="text-sm text-green-200 mt-1">We respond within 24 hours</p>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
                      <ClockIcon className="h-6 w-6 text-green-200" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-1">Office Hours</h3>
                      <p className="text-green-100">Mon - Fri: 9AM - 7PM</p>
                      <p className="text-green-100">Sat - Sun: 10AM - 5PM</p>
                      <p className="text-sm text-green-200 mt-1">Virtual appointments available</p>
                    </div>
                  </motion.div>
                </motion.div>
                
                {/* Social Media Links */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="mt-8 sm:mt-12"
                >
                  {/* <h3 className="font-semibold mb-4">Connect With Us</h3>
                  <div className="flex space-x-4">
                    {['facebook', 'twitter', 'instagram', 'linkedin'].map((social, index) => (
                      <a 
                        key={social}
                        href="#" 
                        className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
                      >
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          {social === 'facebook' && <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />}
                          {social === 'twitter' && <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />}
                          {social === 'instagram' && <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />}
                          {social === 'linkedin' && <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />}
                        </svg>
                      </a>
                    ))}
                  </div> */}
                </motion.div>
              </div>
            </div>
            
            {/* Contact Form - 3 columns */}
            <div id="contact-form" className="lg:col-span-3 p-6 sm:p-8 lg:p-12 mt-16 sm:mt-24 lg:mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6 sm:mb-8"
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
                  className="space-y-5 sm:space-y-6"
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Tell us about your dream property or any questions you have..."
                      required
                    ></textarea>
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
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
      <div id="locations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
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
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31434.71086236988!2d76.2758474953037!3d9.98884249810199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d424a38730b%3A0xe5132469a6753307!2sVattoly%20Towers!5e0!3m2!1sen!2sin!4v1755674504066!5m2!1sen!2sin"
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
                    city: "Cochin",
                    address: "Vattoly Annexe, 2nd Floor SRM Road Cochin 682018 Kerala, India",
                    phone: "+91 9526661555",
                    email: "asseton@asseton.in"
                  },
                  {
                    city: "Kannur",
                    address: "Absam Complex 1st Floor South Bazaar Kannur 670002 Kerala, India",
                    phone: "+91 8590847916",
                    email: "asseton@asseton.in"
                  },
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
                    aria-controls={`faq-${index}`}
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
                        id={`faq-${index}`}
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














