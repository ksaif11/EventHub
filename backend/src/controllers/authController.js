import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import User from "../models/User.js";
import OtpVerification from "../models/OtpVerification.js";
import { validateFields } from "../utils/validateFields.js";
import { generateOtp } from "../utils/otpGenerator.js";
import { sendEmail, sendHtmlEmail } from "../utils/sendEmail.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";
import { getEmailTemplate } from "../utils/emailTemplates.js";

export const requestOtp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { isValid, missing } = validateFields(["email", "password", "name"], req.body);
    if (!isValid) return res.status(400).json({ success: false, message: `Missing: ${missing.join(", ")}` });

    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, message: "Invalid email" });
    if (String(password).length < 6) return res.status(400).json({ success: false, message: "Password must be >= 6 chars" });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.findOneAndUpdate(
      { email },
      { name: name || "", passwordHash, isVerified: false },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpVerification.deleteMany({ email });
    await OtpVerification.create({ email, hashedOtp, expiresAt });

    // Use the new HTML email template
    const emailTemplate = getEmailTemplate('otpVerification', [otp, name]);
    await sendHtmlEmail(email, emailTemplate.subject, emailTemplate.html);

    return res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const { isValid, missing } = validateFields(["email", "otp"], req.body);
    if (!isValid) return res.status(400).json({ success: false, message: `Missing: ${missing.join(", ")}` });

    const record = await OtpVerification.findOne({ email });
    if (!record) return res.status(400).json({ success: false, message: "OTP expired or invalid" });
    if (record.expiresAt < new Date()) {
      await OtpVerification.deleteOne({ email });
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const ok = await bcrypt.compare(otp, record.hashedOtp);
    if (!ok) return res.status(400).json({ success: false, message: "Invalid OTP" });

    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    await OtpVerification.deleteOne({ email });
    const sanitizedUser = sanitizeUser(user);

    // Send welcome email (non-blocking)
    try {
      const welcomeTemplate = getEmailTemplate('welcomeEmail', [user.name]);
      await sendHtmlEmail(email, welcomeTemplate.subject, welcomeTemplate.html);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return res.json({ success: true, token, sanitizedUser });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { isValid, missing } = validateFields(["email", "password"], req.body);
    if (!isValid) return res.status(400).json({ success: false, message: `Missing: ${missing.join(", ")}` });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });
    if (!user.isVerified) return res.status(400).json({ success: false, message: "Please verify your email first" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const sanitizedUser = sanitizeUser(user);

    return res.json({ success: true, token, sanitizedUser });
  } catch (err) {
    next(err);
  }
};
