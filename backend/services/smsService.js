/**
 * SMS Service using Twilio
 * 
 * Research Relevance:
 * - Enables real-time alerts to farmers without internet
 * - Supports low-bandwidth agricultural communities
 * - Tracks SMS delivery for notification effectiveness research
 * 
 * SECURITY NOTE:
 * - Twilio credentials loaded from environment variables only
 * - Never hardcode credentials in this file
 */

const twilio = require('twilio');

// Load Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client only if credentials are valid
let client = null;
let isSMSEnabled = false;

// Check if credentials are properly configured (not placeholders)
const isValidAccountSid = accountSid && accountSid.startsWith('AC') && accountSid.length > 20;
const isValidAuthToken = authToken && authToken.length > 20;
const isValidPhoneNumber = fromPhone && fromPhone.startsWith('+');

if (isValidAccountSid && isValidAuthToken && isValidPhoneNumber) {
  try {
    client = twilio(accountSid, authToken);
    isSMSEnabled = true;
    console.log('📱 SMS Service: Twilio initialized successfully');
  } catch (error) {
    console.error('📱 SMS Service: Failed to initialize Twilio:', error.message);
    isSMSEnabled = false;
  }
} else {
  // Silently skip SMS initialization in development
  if (process.env.NODE_ENV === 'production') {
    console.log('📱 SMS Service: Twilio credentials not configured. SMS alerts disabled.');
  }
}

class SMSService {
  /**
   * Send SMS to a phone number
   * @param {string} to - Recipient phone number (with country code, e.g., +919876543210)
   * @param {string} message - SMS message body
   * @returns {Promise<Object>} - Result of SMS send operation
   */
  async sendSMS(to, message) {
    // Check if SMS is enabled
    if (!isSMSEnabled || !client) {
      console.log('📱 SMS Service: SMS not configured. Message would have been:', message);
      return {
        success: false,
        sent: false,
        reason: 'SMS_NOT_CONFIGURED',
        message: 'Twilio not configured. Check environment variables.'
      };
    }

    // Validate phone number
    if (!to || !this.isValidPhoneNumber(to)) {
      console.log('📱 SMS Service: Invalid phone number:', to);
      return {
        success: false,
        sent: false,
        reason: 'INVALID_PHONE',
        message: 'Invalid phone number format'
      };
    }

    try {
      const result = await client.messages.create({
        body: message,
        from: fromPhone,
        to: to
      });

      console.log(`📱 SMS Service: Message sent successfully. SID: ${result.sid}`);
      
      return {
        success: true,
        sent: true,
        sid: result.sid,
        status: result.status,
        message: 'SMS sent successfully'
      };
    } catch (error) {
      // Handle Twilio trial account restrictions
      if (error.code === 21211) {
        console.warn('📱 SMS Service: Trial account - number not verified:', to);
        return {
          success: false,
          sent: false,
          reason: 'TRIAL_RESTRICTION',
          message: 'Phone number not verified in Twilio trial account'
        };
      }

      if (error.code === 21608) {
        console.warn('📱 SMS Service: Trial account - cannot send to unverified numbers');
        return {
          success: false,
          sent: false,
          reason: 'TRIAL_RESTRICTION',
          message: 'Twilio trial accounts can only send to verified numbers'
        };
      }

      // Log error but don't crash
      console.error('📱 SMS Service: Failed to send SMS:', error.message);
      
      return {
        success: false,
        sent: false,
        reason: 'TWILIO_ERROR',
        code: error.code,
        message: error.message
      };
    }
  }

  /**
   * Send alert SMS to farmer
   * @param {string} mobile - Farmer's mobile number
   * @param {string} alertMessage - Alert message
   * @returns {Promise<Object>} - Result
   */
  async sendFarmerAlert(mobile, alertMessage) {
    const formattedMessage = `Soil2Crop Alert 🌱: ${alertMessage}`;
    return await this.sendSMS(mobile, formattedMessage);
  }

  /**
   * Send crop advisory SMS to farmer
   * @param {string} mobile - Farmer's mobile number
   * @param {string} advisory - Advisory message
   * @returns {Promise<Object>} - Result
   */
  async sendCropAdvisory(mobile, advisory) {
    const formattedMessage = `Soil2Crop Advisory 🌾: ${advisory}`;
    return await this.sendSMS(mobile, formattedMessage);
  }

  /**
   * Send soil report notification
   * @param {string} mobile - Farmer's mobile number
   * @param {string} status - Report status message
   * @returns {Promise<Object>} - Result
   */
  async sendSoilReportNotification(mobile, status) {
    const formattedMessage = `Soil2Crop Soil Report 📊: ${status}`;
    return await this.sendSMS(mobile, formattedMessage);
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - Is valid
   */
  isValidPhoneNumber(phone) {
    // Basic E.164 format validation (+ followed by 10-15 digits)
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Format Indian mobile number to E.164 format
   * @param {string} mobile - Mobile number (e.g., 9876543210 or +919876543210)
   * @returns {string|null} - Formatted number or null
   */
  formatIndianMobile(mobile) {
    if (!mobile) return null;
    
    // Remove all non-digit characters
    const digits = mobile.replace(/\D/g, '');
    
    // If starts with 91 and has 12 digits, add +
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits}`;
    }
    
    // If 10 digits, add +91
    if (digits.length === 10) {
      return `+91${digits}`;
    }
    
    // If already has +, return as is
    if (mobile.startsWith('+')) {
      return mobile;
    }
    
    return null;
  }

  /**
   * Get SMS service status
   * @returns {Object} - Service status
   */
  getStatus() {
    return {
      enabled: isSMSEnabled,
      configured: !!(accountSid && authToken && fromPhone),
      fromNumber: fromPhone ? fromPhone.replace(/\d(?=\d{4})/g, '*') : null // Mask number
    };
  }
}

module.exports = new SMSService();
