import sgMail, { initializeSendGrid, getSendGridConfig } from '../config/sendgrid.js';

export { getSendGridConfig };

export const sendEmail = async (to, subject, text, html = null) => {
  try {
    // Check if SendGrid is properly configured
    const config = getSendGridConfig();
    if (!config.isConfigured) {
      throw new Error('SendGrid is not properly configured. Please check your environment variables.');
    }

    // Initialize SendGrid if not already done
    if (!sgMail.apiKey) {
      const initialized = initializeSendGrid();
      if (!initialized) {
        throw new Error('Failed to initialize SendGrid');
      }
    }

    const msg = {
      to,
      from: config.fromEmail,
      subject,
      text, // Plain text fallback
      ...(html && { html }) // HTML version if provided
    };

    const result = await sgMail.send(msg);
    
    return {
      success: true,
      messageId: result[0]?.headers['x-message-id'],
      to,
      subject
    };
  } catch (error) {
    // Provide more specific error messages
    if (error.response) {
      const { body } = error.response;
      if (body && body.errors) {
        const errorMessages = body.errors.map(err => err.message).join(', ');
        throw new Error(`SendGrid API Error: ${errorMessages}`);
      }
    }
    
    if (error.message.includes('Unauthorized')) {
      throw new Error('SendGrid API key is invalid or expired. Please check your SENDGRID_API_KEY.');
    }
    
    if (error.message.includes('Forbidden')) {
      throw new Error('SendGrid API key does not have permission to send emails. Please check your API key permissions.');
    }
    
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Convenience function for sending HTML emails
export const sendHtmlEmail = async (to, subject, html) => {
  // Extract plain text from HTML for fallback
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return sendEmail(to, subject, text, html);
};

// Test function to verify SendGrid configuration
export const testSendGridConnection = async () => {
  try {
    const config = getSendGridConfig();
    if (!config.isConfigured) {
      return {
        success: false,
        error: 'SendGrid not configured. Please set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL in your .env file.'
      };
    }

    // Try to send a test email to verify the configuration
    const testResult = await sendEmail(
      'test@example.com',
      'SendGrid Connection Test',
      'This is a test email to verify SendGrid configuration.'
    );

    return {
      success: true,
      message: 'SendGrid is properly configured and working!',
      config: {
        fromEmail: config.fromEmail,
        apiKeyConfigured: !!config.apiKey
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
