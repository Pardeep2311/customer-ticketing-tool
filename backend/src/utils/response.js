// Standardized API response helper

const sendResponse = (res, statusCode, success, message, data = null, error = null) => {
  const response = {
    success,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  if (error !== null) {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data);
};

const sendError = (res, message, error = null, statusCode = 400) => {
  return sendResponse(res, statusCode, false, message, null, error);
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError
};

