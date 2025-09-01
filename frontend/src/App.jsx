import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./pages/HomePage/HomePage";
import EventDetailPage from "./pages/EventDetailPage/EventDetailPage";
import RequireAuth from "./components/RequireAuth";
import CreateEventPage from "./pages/CreateEventPage/CreateEventPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import FeedbackPage from "./pages/FeedbackPage/FeedbackPage";
import Signup from "./pages/Auth/Signup";
import VerifyOtp from "./pages/Auth/VerifyOtp";
import Login from "./pages/Auth/LoginPage";
import GlobalSnackbar from "./components/GlobalSnackbar/GlobalSnackbar";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route
          path="/create-event"
          element={
            <RequireAuth>
              <CreateEventPage />
            </RequireAuth>
          }
        />
        <Route 
          path="/dashboard" 
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          } 
        />
        <Route 
          path="/feedback/:eventId" 
          element={
            <RequireAuth>
              <FeedbackPage />
            </RequireAuth>
          } 
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}
