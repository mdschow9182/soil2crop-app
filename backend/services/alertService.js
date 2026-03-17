/**
 * Alert Service (MongoDB Version)
 * 
 * Research Relevance:
 * - Tracks alert effectiveness (read vs unread)
 * - Supports intervention timing studies
 * - Enables notification optimization research
 */

const mongoose = require('mongoose');

// Alert Schema (defined inline since it's simple)
const alertSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'action', 'reminder'],
    default: 'info'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create model if not exists
const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);

class AlertService {
  /**
   * Create a new alert
   * @param {Object} alertData - { farmer_id, message, type }
   * @returns {Promise<Object>} - Created alert
   */
  async createAlert(alertData) {
    const { farmer_id, message, type = 'info' } = alertData;

    const alert = await Alert.create({
      farmerId: farmer_id,
      message,
      type,
      isRead: false
    });

    return alert;
  }

  /**
   * Get all alerts for a farmer
   * @param {string} farmerId - MongoDB ObjectId
   * @returns {Promise<Array>}
   */
  async getAlertsByFarmer(farmerId) {
    return await Alert.find({ farmerId }).sort({ createdAt: -1 });
  }

  /**
   * Get unread alerts for a farmer
   * @param {string} farmerId - MongoDB ObjectId
   * @returns {Promise<Array>}
   */
  async getUnreadAlerts(farmerId) {
    return await Alert.find({ farmerId, isRead: false }).sort({ createdAt: -1 });
  }

  /**
   * Mark alert as read
   * @param {string} alertId - MongoDB ObjectId
   * @returns {Promise<boolean>}
   */
  async markAsRead(alertId) {
    try {
      const result = await Alert.findByIdAndUpdate(
        alertId,
        { isRead: true },
        { new: true }
      );
      return !!result;
    } catch (error) {
      return false;
    }
  }

  /**
   * Mark all alerts as read for a farmer
   * @param {string} farmerId - MongoDB ObjectId
   * @returns {Promise<number>} - Number of alerts marked as read
   */
  async markAllAsRead(farmerId) {
    const result = await Alert.updateMany(
      { farmerId, isRead: false },
      { isRead: true }
    );
    return result.modifiedCount;
  }

  /**
   * Delete an alert
   * @param {string} alertId - MongoDB ObjectId
   * @returns {Promise<boolean>}
   */
  async deleteAlert(alertId) {
    try {
      const result = await Alert.findByIdAndDelete(alertId);
      return !!result;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get alert count for a farmer
   * @param {string} farmerId - MongoDB ObjectId
   * @returns {Promise<Object>} - { total, unread }
   */
  async getAlertCount(farmerId) {
    const total = await Alert.countDocuments({ farmerId });
    const unread = await Alert.countDocuments({ farmerId, isRead: false });

    return { total, unread };
  }

  /**
   * Create crop calendar alerts for a farmer
   * @param {string} farmerId - MongoDB ObjectId
   * @param {string} cropName 
   * @returns {Promise<Array>} - Created alerts
   */
  async createCropCalendarAlerts(farmerId, cropName) {
    const alerts = [];
    const now = new Date();

    // Sowing alert (immediate)
    alerts.push(await this.createAlert({
      farmer_id: farmerId,
      message: `Time to sow ${cropName}! Prepare your seeds and check soil moisture.`,
      type: 'action'
    }));

    // Growth stage alert (2 weeks later)
    const growthDate = new Date(now);
    growthDate.setDate(growthDate.getDate() + 14);
    alerts.push(await this.createAlert({
      farmer_id: farmerId,
      message: `${cropName} should be in vegetative growth stage. Apply fertilizer if needed.`,
      type: 'reminder'
    }));

    // Flowering alert (8 weeks later)
    const floweringDate = new Date(now);
    floweringDate.setDate(floweringDate.getDate() + 56);
    alerts.push(await this.createAlert({
      farmer_id: farmerId,
      message: `${cropName} flowering stage approaching. Monitor for pests.`,
      type: 'reminder'
    }));

    // Harvest alert (14 weeks later)
    const harvestDate = new Date(now);
    harvestDate.setDate(harvestDate.getDate() + 98);
    alerts.push(await this.createAlert({
      farmer_id: farmerId,
      message: `${cropName} ready for harvest! Check grain moisture before harvesting.`,
      type: 'action'
    }));

    return alerts;
  }

  /**
   * Get alert statistics for research
   * @returns {Promise<Object>}
   */
  async getAlertStats() {
    const totalAlerts = await Alert.countDocuments();
    const readAlerts = await Alert.countDocuments({ isRead: true });
    
    const typeDistribution = await Alert.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    return {
      totalAlerts,
      readAlerts,
      unreadAlerts: totalAlerts - readAlerts,
      readRate: totalAlerts > 0 ? (readAlerts / totalAlerts) : 0,
      typeDistribution: typeDistribution.map(item => ({
        type: item._id,
        count: item.count
      }))
    };
  }
}

module.exports = new AlertService();
