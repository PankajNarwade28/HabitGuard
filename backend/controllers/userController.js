const db = require('../config/db');

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const { name, age, education, mobile_no } = req.body;

    // Validate input
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters'
      });
    }

    // Prepare update query
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (age !== undefined) {
      updates.push('age = ?');
      values.push(age);
    }
    if (education !== undefined) {
      updates.push('education = ?');
      values.push(education.trim() || null);
    }
    if (mobile_no !== undefined) {
      updates.push('mobile_no = ?');
      values.push(mobile_no.trim() || null);
    }

    // Add userId to values array
    values.push(userId);

    // Update user
    const query = `UPDATE users SET ${updates.join(', ')} WHERE u_id = ?`;
    await db.execute(query, values);

    // Fetch updated user data
    const [users] = await db.execute(
      'SELECT u_id, name, email, age, education, mobile_no, created_at FROM users WHERE u_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        userId: user.u_id,
        name: user.name,
        email: user.email,
        age: user.age,
        education: user.education,
        mobile_no: user.mobile_no,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Get user
    const [users] = await db.execute(
      'SELECT password FROM users WHERE u_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Verify current password
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.execute(
      'UPDATE users SET password = ? WHERE u_id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

/**
 * Delete account
 */
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const { password } = req.body;

    // Validate input
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    // Get user
    const [users] = await db.execute(
      'SELECT password FROM users WHERE u_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Verify password
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Delete user
    await db.execute('DELETE FROM users WHERE u_id = ?', [userId]);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};
