export const cors = {
  origin: "http://localhost:8080",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS", "HEAD"] as (
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "OPTIONS"
    | "HEAD"
    | "DELETE"
    | "ANY"
  )[],
  headers: [
    "X-Requested-With",
    "X-HTTP-Method-Override",
    "Cache-Control",
    "Content-Language",
    "Content-Length",
    "Content-Type",
    "Expires",
    "Cookie",
    "Set-Cookie",
    "Last-Modified",
    "Pragma",
    "Accept",
    "WWW-Authenticate",
    "Server-Authorization",
  ],
  allowCredentials: true,
};
