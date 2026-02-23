
const API_URL =
  process.env.NODE_ENV === "production"
    ? "http://localhost:3001"
    : "http://localhost:3001";
module.exports = API_URL;
