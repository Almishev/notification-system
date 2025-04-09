"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FaTrash, FaEdit } from "react-icons/fa";
import EditEmailButton from "@/app/components/EditEmailButton";

interface ScheduledEmail {
    _id: string;
    recipients: string[];
    subject: string;
    message: string;
    scheduledDate: string;
    status: 'pending' | 'sent' | 'failed';
    createdAt: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState({
        _id: "",
        username: "",
        email: ""
    });
    const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    // Fetch user details and scheduled emails
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await axios.get('/api/users/me');
                setUser(userResponse.data.data);

                const emailsResponse = await axios.get('/api/email/schedule');
                setScheduledEmails(emailsResponse.data.scheduledEmails);
            } catch (error: any) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'sent':
                return 'bg-success';
            case 'failed':
                return 'bg-danger';
            default:
                return 'bg-warning';
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this scheduled email?')) {
            try {
                setDeleting(id);
                await axios.delete(`/api/email/schedule/${id}`);
                setScheduledEmails(emails => emails.filter(email => email._id !== id));
                toast.success('Email deleted successfully');
            } catch (error: any) {
                console.error("Error deleting email:", error);
                toast.error(error.response?.data?.error || "Failed to delete email");
            } finally {
                setDeleting(null);
            }
        }
    };

    const logout = async () => {
        try {
            await axios.get('/api/users/logout');
            toast.success('Logout successful');
            router.push('/login');
        } catch (error: any) {
            console.error("Logout failed:", error);
            toast.error(error.message);
        }
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-12 mb-4">
                    <div className="card shadow">
                        <div className="card-body">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                <div>
                                    <h2 className="card-title mb-0">Welcome, {user.username}!</h2>
                                    <p className="text-muted mb-0">{user.email}</p>
                                </div>
                                <div className="d-flex gap-2">
                                    <Link href={`/profile/${user._id}`} className="btn btn-primary">
                                        Schedule New Email
                                    </Link>
                                    <button onClick={logout} className="btn btn-danger">
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="card shadow">
                        <div className="card-body">
                            <h3 className="card-title mb-4">Scheduled Emails</h3>
                            {scheduledEmails.length === 0 ? (
                                <p className="text-muted">No scheduled emails found.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Subject</th>
                                                <th className="d-none d-md-table-cell">Recipients</th>
                                                <th>Scheduled For</th>
                                                <th>Status</th>
                                                <th className="d-none d-md-table-cell">Created At</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {scheduledEmails.map((email) => (
                                                <tr key={email._id}>
                                                    <td>{email.subject}</td>
                                                    <td className="d-none d-md-table-cell">
                                                        {email.recipients.join(", ")}
                                                    </td>
                                                    <td>{formatDate(email.scheduledDate)}</td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadgeClass(email.status)}`}>
                                                            {email.status}
                                                        </span>
                                                    </td>
                                                    <td className="d-none d-md-table-cell">
                                                        {formatDate(email.createdAt)}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <EditEmailButton 
                                                                email={email} 
                                                                onUpdate={() => {
                                                                    // Refresh the email list after update
                                                                    const fetchData = async () => {
                                                                        try {
                                                                            const emailsResponse = await axios.get('/api/email/schedule');
                                                                            setScheduledEmails(emailsResponse.data.scheduledEmails);
                                                                        } catch (error: any) {
                                                                            console.error("Error fetching data:", error);
                                                                            toast.error("Failed to refresh email list");
                                                                        }
                                                                    };
                                                                    fetchData();
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => handleDelete(email._id)}
                                                                disabled={deleting === email._id}
                                                                className="btn btn-danger btn-sm"
                                                            >
                                                                {deleting === email._id ? (
                                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                                ) : (
                                                                    <FaTrash />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}