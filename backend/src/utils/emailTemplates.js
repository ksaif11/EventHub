// Casual email templates for Socio-Gather
// Not too professional, but still engaging and friendly

export const emailTemplates = {
  // OTP Verification Email
  otpVerification: (otp, userName = "there") => ({
    subject: "🎉 Welcome to Socio-Gather! Here's your verification code",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px;">
        <div style="text-align: center; padding: 30px 20px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🎉 Hey ${userName}!</h1>
          <p style="font-size: 18px; margin: 20px 0; opacity: 0.9;">Welcome to Socio-Gather! We're excited to have you join our community.</p>
          
          <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 12px; margin: 25px 0;">
            <p style="margin: 0 0 15px 0; font-size: 16px;">Here's your verification code:</p>
            <div style="background: white; color: #667eea; font-size: 32px; font-weight: bold; padding: 15px; border-radius: 8px; letter-spacing: 5px; font-family: monospace;">
              ${otp}
            </div>
            <p style="margin: 15px 0 0 0; font-size: 14px; opacity: 0.8;">⏰ This code expires in 5 minutes</p>
          </div>
          
          <p style="font-size: 16px; margin: 25px 0;">Once verified, you'll be able to:</p>
          <ul style="text-align: left; display: inline-block; font-size: 16px;">
            <li>🎪 Create amazing events</li>
            <li>🤝 Join community meetups</li>
            <li>💬 Connect with like-minded people</li>
            <li>⭐ Share your experiences</li>
          </ul>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">See you at the next event! 🚀</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">- The Socio-Gather Team</p>
          </div>
        </div>
      </div>
    `
  }),

  // Event Invitation Email
  eventInvitation: (eventTitle, eventDate, eventLocation, organizerName, eventLink) => ({
    subject: `🎪 You're invited to: ${eventTitle}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px;">
        <div style="text-align: center; padding: 30px 20px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🎪 You're Invited!</h1>
          <p style="font-size: 18px; margin: 20px 0; opacity: 0.9;">${organizerName} wants you to join their event!</p>
          
          <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: left;">
            <h2 style="margin: 0 0 15px 0; font-size: 24px; color: #ffd700;">${eventTitle}</h2>
            <div style="margin: 15px 0;">
              <p style="margin: 5px 0; font-size: 16px;">📅 <strong>When:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p style="margin: 5px 0; font-size: 16px;">📍 <strong>Where:</strong> ${eventLocation}</p>
              <p style="margin: 5px 0; font-size: 16px;">👤 <strong>Organizer:</strong> ${organizerName}</p>
            </div>
          </div>
          
          <a href="${eventLink}" style="display: inline-block; background: #ffd700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; margin: 20px 0;">
            🎉 Join This Event!
          </a>
          
          <p style="font-size: 16px; margin: 25px 0; opacity: 0.9;">Can't make it? No worries! Just let us know.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">See you there! 🚀</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">- The Socio-Gather Team</p>
          </div>
        </div>
      </div>
    `
  }),

  // Feedback Request Email
  feedbackRequest: (eventTitle, attendeeName, feedbackLink) => ({
    subject: `💭 How was "${eventTitle}"? We'd love to hear from you!`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px;">
        <div style="text-align: center; padding: 30px 20px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">💭 Hey ${attendeeName}!</h1>
          <p style="font-size: 18px; margin: 20px 0; opacity: 0.9;">We hope you had an amazing time at <strong>"${eventTitle}"</strong>!</p>
          
          <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 12px; margin: 25px 0;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">Your feedback helps us make events even better! 🌟</p>
            <p style="margin: 0; font-size: 16px;">Share your thoughts about:</p>
            <ul style="text-align: left; display: inline-block; font-size: 16px; margin: 15px 0;">
              <li>🎯 How was the event overall?</li>
              <li>👤 How was the organizer?</li>
              <li>💡 Any suggestions for improvement?</li>
              <li>🤝 Would you attend again?</li>
            </ul>
          </div>
          
          <a href="${feedbackLink}" style="display: inline-block; background: #ffd700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; margin: 20px 0;">
            📝 Share Your Feedback
          </a>
          
          <p style="font-size: 14px; margin: 20px 0; opacity: 0.8;">⏰ This link expires in 7 days</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Thanks for being part of our community! 🙏</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">- The Socio-Gather Team</p>
          </div>
        </div>
      </div>
    `
  }),

  // Event Reminder Email
  eventReminder: (eventTitle, eventDate, eventLocation, attendeeName) => ({
    subject: `⏰ Reminder: "${eventTitle}" is happening soon!`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px;">
        <div style="text-align: center; padding: 30px 20px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">⏰ Don't forget!</h1>
          <p style="font-size: 18px; margin: 20px 0; opacity: 0.9;">Hey ${attendeeName}, your event is coming up soon!</p>
          
          <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: left;">
            <h2 style="margin: 0 0 15px 0; font-size: 24px; color: #ffd700;">${eventTitle}</h2>
            <div style="margin: 15px 0;">
              <p style="margin: 5px 0; font-size: 16px;">📅 <strong>When:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p style="margin: 5px 0; font-size: 16px;">📍 <strong>Where:</strong> ${eventLocation}</p>
            </div>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;">🎒 <strong>Don't forget to bring:</strong></p>
            <ul style="text-align: left; display: inline-block; font-size: 16px; margin: 10px 0;">
              <li>Your enthusiasm! 🎉</li>
              <li>An open mind 💭</li>
              <li>Maybe some snacks? 🍕</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; margin: 25px 0; opacity: 0.9;">We're excited to see you there! 🚀</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Have a great time! 🎪</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">- The Socio-Gather Team</p>
          </div>
        </div>
      </div>
    `
  }),

  // Welcome Email (after successful verification)
  welcomeEmail: (userName) => ({
    subject: "🎉 Welcome to Socio-Gather! You're all set!",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px;">
        <div style="text-align: center; padding: 30px 20px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🎉 Welcome aboard, ${userName}!</h1>
          <p style="font-size: 18px; margin: 20px 0; opacity: 0.9;">Your email is verified and you're ready to start your Socio-Gather journey!</p>
          
          <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 12px; margin: 25px 0;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">Here's what you can do now:</p>
            <ul style="text-align: left; display: inline-block; font-size: 16px; margin: 15px 0;">
              <li>🎪 Browse and join exciting events</li>
              <li>🚀 Create your own amazing events</li>
              <li>🤝 Connect with the community</li>
              <li>⭐ Share your experiences</li>
              <li>💬 Give feedback on events you attend</li>
            </ul>
          </div>
          
          <a href="${process.env.APP_BASE_URL || 'http://localhost:5173'}" style="display: inline-block; background: #ffd700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; margin: 20px 0;">
            🚀 Start Exploring Events
          </a>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Happy eventing! 🎉</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">- The Socio-Gather Team</p>
          </div>
        </div>
      </div>
    `
  })
};

// Helper function to get template
export const getEmailTemplate = (templateName, data) => {
  const template = emailTemplates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }
  
  if (typeof template === 'function') {
    return template(data);
  }
  
  return template;
};

