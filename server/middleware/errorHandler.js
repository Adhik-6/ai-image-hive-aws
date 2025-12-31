
const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') console.error("Error Stack:", err.stack);
  else console.error("Error Msg:", err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Optional: useful for frontend debugging
    statusCode: statusCode 
  });
}

export default errorHandler;