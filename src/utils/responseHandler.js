function sendError(res, statusCode, message) {
  return res.status(statusCode).json({
    error: true,
    message
  });
}

function sendBadRequest(res, message) {
  return sendError(res, 400, message);
}

function sendNotFound(res, message) {
  return sendError(res, 404, message);
}

function sendInternalError(res, message) {
  return sendError(res, 500, message);
}

function isValidId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

module.exports = {
  sendBadRequest,
  sendNotFound,
  sendInternalError,
  isValidId
};
