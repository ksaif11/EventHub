// Example usage of email templates
// This file demonstrates how to use the email templates in your application

import { getEmailTemplate } from './emailTemplates.js';
import { sendHtmlEmail } from './sendEmail.js';

// Example 1: Send OTP verification email
export const sendOtpEmail = async (email, otp, userName) => {
  try {
    const template = getEmailTemplate('otpVerification', [otp, userName]);
    await sendHtmlEmail(email, template.subject, template.html);
    console.log('✅ OTP email sent successfully');
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
  }
};

// Example 2: Send event invitation email
export const sendEventInvitation = async (email, eventData) => {
  try {
    const { title, date, location, organizerName, eventLink } = eventData;
    const template = getEmailTemplate('eventInvitation', [title, date, location, organizerName, eventLink]);
    await sendHtmlEmail(email, template.subject, template.html);
    console.log('✅ Event invitation sent successfully');
  } catch (error) {
    console.error('❌ Failed to send event invitation:', error);
  }
};

// Example 3: Send feedback request email
export const sendFeedbackRequest = async (email, eventTitle, attendeeName, feedbackLink) => {
  try {
    const template = getEmailTemplate('feedbackRequest', [eventTitle, attendeeName, feedbackLink]);
    await sendHtmlEmail(email, template.subject, template.html);
    console.log('✅ Feedback request sent successfully');
  } catch (error) {
    console.error('❌ Failed to send feedback request:', error);
  }
};

// Example 4: Send event reminder email
export const sendEventReminder = async (email, eventData) => {
  try {
    const { title, date, location, attendeeName } = eventData;
    const template = getEmailTemplate('eventReminder', [title, date, location, attendeeName]);
    await sendHtmlEmail(email, template.subject, template.html);
    console.log('✅ Event reminder sent successfully');
  } catch (error) {
    console.error('❌ Failed to send event reminder:', error);
  }
};

// Example 5: Send welcome email
export const sendWelcomeEmail = async (email, userName) => {
  try {
    const template = getEmailTemplate('welcomeEmail', [userName]);
    await sendHtmlEmail(email, template.subject, template.html);
    console.log('✅ Welcome email sent successfully');
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
  }
};

// Usage examples:
/*
// Send OTP
await sendOtpEmail('user@example.com', '123456', 'John Doe');

// Send event invitation
await sendEventInvitation('user@example.com', {
  title: 'Tech Meetup 2024',
  date: new Date('2024-01-15T18:00:00'),
  location: 'Downtown Conference Center',
  organizerName: 'Jane Smith',
  eventLink: 'https://socio-gather.com/events/123'
});

// Send feedback request
await sendFeedbackRequest(
  'user@example.com',
  'Tech Meetup 2024',
  'John Doe',
  'https://socio-gather.com/feedback?token=abc123'
);

// Send event reminder
await sendEventReminder('user@example.com', {
  title: 'Tech Meetup 2024',
  date: new Date('2024-01-15T18:00:00'),
  location: 'Downtown Conference Center',
  attendeeName: 'John Doe'
});

// Send welcome email
await sendWelcomeEmail('user@example.com', 'John Doe');
*/

