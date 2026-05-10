import jwt from "jsonwebtoken";

const secret = "SUPER_SECRET_KEY";

const token = jwt.sign(
  { role: "admin" },
  secret,
  { expiresIn: "365d" }
);

console.log("ADMIN TOKEN:");
console.log(token);