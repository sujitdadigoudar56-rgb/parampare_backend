export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const HTTP_MESSAGES = {
  OK: 'Success',
  CREATED: 'Resource created successfully',
  BAD_REQUEST: 'Bad request',
  UNAUTHORIZED: 'Not authorized',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  
  // Custom messages
  USER_EXISTS: 'User already exists',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  INVALID_OTP: 'Invalid OTP',
  OTP_EXPIRED: 'OTP expired',
  PHONE_REQUIRED: 'Phone number is required',
  PHONE_OTP_REQUIRED: 'Phone number and OTP are required',
};
