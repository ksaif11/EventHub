import { sendFeedbackEmails } from "../controllers/feedbackController.js";
import { connectDB } from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const runFeedbackEmailJob = async () => {
  try {
    console.log("🕐 Starting feedback email job...");
    
    await connectDB();
    
    const result = await sendFeedbackEmails();
    
    console.log(`✅ Feedback email job completed:`);
    console.log(`   - Events processed: ${result.eventsProcessed}`);
    console.log(`   - Emails sent: ${result.emailsSent}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Feedback email job failed:", error);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  runFeedbackEmailJob();
}

export { runFeedbackEmailJob };
