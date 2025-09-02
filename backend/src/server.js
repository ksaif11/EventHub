import app from "./app.js";
import { connectDB } from "./config/db.js";
import "./config/redis.js";

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

connectDB();

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
