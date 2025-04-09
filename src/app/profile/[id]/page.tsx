"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function UserProfile({params}: any) {
    const router = useRouter();
    const [email, setEmail] = useState({
        subject: "",
        message: "",
        to: "",
        scheduledDate: "",
        scheduledTime: ""
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            // Split email addresses and trim whitespace
            const recipients = email.to.split(',').map(email => email.trim());
            
            // Combine date and time into a single Date object
            const scheduledDateTime = new Date(`${email.scheduledDate}T${email.scheduledTime}`);

            // Check if the scheduled time is in the past
            if (scheduledDateTime < new Date()) {
                toast.error("Cannot schedule email in the past");
                return;
            }

            const response = await axios.post("/api/email/schedule", {
                recipients,
                subject: email.subject,
                message: email.message,
                scheduledDate: scheduledDateTime
            });
            
            toast.success("Email scheduled successfully!");
            
            setEmail({ subject: "", message: "", to: "", scheduledDate: "", scheduledTime: "" });
           
            router.push('/profile');
        } catch (error: any) {
            console.error("Error scheduling email:", error);
            toast.error(error.response?.data?.error || "Failed to schedule email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow">
                        <div className="card-body">
                            <h1 className="card-title text-center mb-4">Schedule Email</h1>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="to" className="form-label">To: (separate multiple emails with commas)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="to"
                                        value={email.to}
                                        onChange={(e) => setEmail({...email, to: e.target.value})}
                                        placeholder="recipient1@example.com, recipient2@example.com"
                                        required
                                    />
                                    <small className="form-text text-muted">
                                        Enter one or more email addresses separated by commas
                                    </small>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="subject" className="form-label">Subject:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="subject"
                                        value={email.subject}
                                        onChange={(e) => setEmail({...email, subject: e.target.value})}
                                        placeholder="Email subject"
                                        required
                                    />
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="scheduledDate" className="form-label">Date:</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="scheduledDate"
                                            value={email.scheduledDate}
                                            onChange={(e) => setEmail({...email, scheduledDate: e.target.value})}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="scheduledTime" className="form-label">Time:</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            id="scheduledTime"
                                            value={email.scheduledTime}
                                            onChange={(e) => setEmail({...email, scheduledTime: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="message" className="form-label">Message:</label>
                                    <textarea
                                        className="form-control"
                                        id="message"
                                        rows={6}
                                        value={email.message}
                                        onChange={(e) => setEmail({...email, message: e.target.value})}
                                        placeholder="Your message here..."
                                        required
                                    />
                                </div>
                                <div className="d-grid gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? "Scheduling..." : "Schedule Email"}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => router.push('/profile')}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}