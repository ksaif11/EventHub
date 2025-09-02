import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate SendGrid configuration
const validateSendGridConfig = () => {
  const requiredVars = ['SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required SendGrid environment variables: ${missing.join(', ')}`);
  }
  
  return true;
};

// Initialize SendGrid
export const initializeSendGrid = () => {
  try {
    validateSendGridConfig();
    
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    
    sgMail.setApiKey(apiKey);
    
    console.log('SendGrid initialized successfully');
    
    return true;
  } catch (error) {
    console.error('SendGrid initialization failed:', error.message);
    return false;
  }
};

// Get SendGrid configuration
export const getSendGridConfig = () => {
  return {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL || process.env.SENDGRID_VERIFIED_SENDER,
    isConfigured: !!process.env.SENDGRID_API_KEY && !!process.env.SENDGRID_FROM_EMAIL
  };
};

export default sgMail;
