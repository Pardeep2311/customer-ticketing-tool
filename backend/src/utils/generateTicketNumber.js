// Generate unique ticket number
// Format: TKTXXXX (e.g., TKT0001, TKT0002, TKT0123, TKT9999, TKT10000)
// Simple sequential format - numbers grow continuously

const { query } = require('../config/db');

const generateTicketNumber = async () => {
  const prefix = 'TKT';
  
  try {
    // Get the last ticket number (any format)
    const lastTicket = await query(
      `SELECT ticket_number FROM tickets 
       WHERE ticket_number LIKE ? 
       ORDER BY id DESC 
       LIMIT 1`,
      [`${prefix}%`]
    );

    let sequence = 1;
    
    if (lastTicket && lastTicket.length > 0) {
      // Extract sequence number from last ticket
      // Handles both old format (TKT-2025-00001) and new format (TKT0001)
      const lastNumber = lastTicket[0].ticket_number;
      
      // Remove prefix and dashes, extract just the number
      const numberPart = lastNumber.replace(/^TKT-?\d{4}-?/, '').replace(/^TKT/, '');
      const lastSequence = parseInt(numberPart, 10);
      
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    // Format: TKT + sequence number (no leading zeros, natural growth)
    // TKT1, TKT2, ..., TKT9, TKT10, TKT11, ..., TKT999, TKT1000, etc.
    return `${prefix}${sequence}`;
  } catch (error) {
    console.error('Error generating ticket number:', error);
    // Fallback: use timestamp if query fails
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  }
};

module.exports = generateTicketNumber;

