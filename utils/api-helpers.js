import { NextResponse } from "next/server";

export function successResponse(data, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function errorResponse(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function handleApiError(error, defaultMessage = "Server error") {
  console.error("API Error:", error);

  // Handle specific error types
  if (error.name === "ValidationError") {
    return errorResponse(
      Object.values(error.errors)
        .map((err) => err.message)
        .join(", "),
      400
    );
  }

  if (error.code === 11000) {
    return errorResponse("Duplicate entry found", 400);
  }

  if (error.name === "JsonWebTokenError") {
    return errorResponse("Invalid token", 401);
  }

  if (error.name === "TokenExpiredError") {
    return errorResponse("Token expired", 401);
  }

  // Handle MongoDB connection errors
  if (error.name === "MongoServerError") {
    return errorResponse("Database error", 500);
  }

  // Handle network errors
  if (error.code === "ECONNREFUSED") {
    return errorResponse("Service unavailable", 503);
  }

  // Default error response
  return errorResponse(
    process.env.NODE_ENV === "development" ? error.message : defaultMessage,
    500
  );
}

export function validateRequestBody(body, requiredFields) {
  const missingFields = requiredFields.filter((field) => !body[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }
}

export async function withErrorHandling(handler, defaultMessage) {
  try {
    return await handler();
  } catch (error) {
    return handleApiError(error, defaultMessage);
  }
}
