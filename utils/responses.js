const errorResponse = (res, status_code, error, data = null) => {  
    return res.status(status_code).json({
      success: false,
      error: error,
      data: data || null,
    });
  };
  
  const successResponse = (res, status_code, message, data = null) => {
    return res.status(status_code).json({
      success: true,
      message: message,
      data: data || null,
    });
  };
  
  module.exports = { errorResponse, successResponse };
  