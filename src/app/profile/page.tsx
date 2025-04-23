"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FaTrash, FaEnvelope, FaSms, FaCalendarAlt, FaUser, FaPlus, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import EditEmailButton from "@/app/components/EditEmailButton";
import EditSMSButton from "@/app/components/EditSMSButton";
import "./profile.css";

interface ScheduledEmail {
    _id: string;
    recipients: string[];
    subject: string;
    message: string;
    scheduledDate: string;
    status: 'В процес' | 'Изпратен' | 'Неуспешен';
    createdAt: string;
}

interface ScheduledSMS {
    _id: string;
    phoneNumber: string;
    message: string;
    scheduledDate: string;
    status: 'pending' | 'processing' | 'sent' | 'failed';
    createdAt: string;
}

interface MessageStats {
    totalEmails: number;
    totalSMS: number;
    lastUpdated: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState({
        _id: "",
        username: "",
        email: ""
    });
    const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
    const [scheduledSMS, setScheduledSMS] = useState<ScheduledSMS[]>([]);
    const [messageStats, setMessageStats] = useState<MessageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await axios.get('/api/users/me');
                setUser(userResponse.data.data);

                // Използваме новия API път за имейли
                const emailsResponse = await axios.get('/api/messages/email');
                setScheduledEmails(emailsResponse.data.data || []);

                try {
                    const smsResponse = await axios.get('/api/messages/sms');
                    setScheduledSMS(smsResponse.data.scheduledSMS || []);
                } catch (error) {
                    console.error("Error fetching SMS data:", error);
                }
                
                // Извличане на статистика за съобщенията
                try {
                    const statsResponse = await axios.get('/api/messages/stats');
                    setMessageStats(statsResponse.data.stats);
                } catch (error) {
                    console.error("Error fetching message stats:", error);
                }
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
            case 'Изпратен':
                return 'bg-success';
            case 'Неуспешен':
                return 'bg-danger';
            case 'sent':
                return 'bg-success';
            case 'failed':
                return 'bg-danger';
            default:
                return 'bg-warning';
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Сигурни ли сте, че искате да го изтриете?')) {
            try {
                setDeleting(id);
                await axios.delete(`/api/messages/email/${id}`);
                setScheduledEmails(emails => emails.filter(email => email._id !== id));
                toast.success('Изтриването е успешно');
            } catch (error: any) {
                console.error("Грешка при изтриването:", error);
                toast.error(error.response?.data?.error || "Изтриването неосъществено");
            } finally {
                setDeleting(null);
            }
        }
    };

    const handleDeleteSMS = async (id: string) => {
        if (window.confirm('Сигурни ли сте, че искате да го изтриете?')) {
            try {
                setDeleting(id);
                await axios.delete(`/api/messages/sms?id=${id}`);
                setScheduledSMS(sms => sms.filter(s => s._id !== id));
                toast.success('Изтриването е успешно');
            } catch (error: any) {
                console.error("Грешка при изтриването:", error);
                toast.error(error.response?.data?.error || "Изтриването неосъществено");
            } finally {
                setDeleting(null);
            }
        }
    };

    const logout = async () => {
        try {
            await axios.get('/api/users/logout');
            toast.success('Успешно излизане');
            router.push('/login');
        } catch (error: any) {
            console.error("Logout failed:", error);
            toast.error(error.message);
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'В процес';
            case 'processing': return 'Обработва се';
            case 'sent': return 'Изпратен';
            case 'failed': return 'Неуспешен';
            default: return status;
        }
    };

    const getStats = () => {
        if (messageStats) {
            return {
                totalEmails: messageStats.totalEmails || 0,
                totalSMS: messageStats.totalSMS || 0
            };
        }
        
        // Фолбек към старата логика, ако статистиките не са налични
        return {
            totalEmails: scheduledEmails.length,
            totalSMS: scheduledSMS.length
        };
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Зареждане...</span>
                    </div>
                </div>
            </div>
        );
    }

    const stats = getStats();

    return (
        <main className="container py-4 min-vh-100">
            <div className="welcome-panel mb-4 p-4 bg-success text-white rounded-3 shadow">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div className="mb-3 mb-md-0">
                        <h2 className="fw-bold mb-1">
                            <FaUser className="me-2" /> Добре дошли, {user.username}!
                        </h2>
                        <p className="mb-0 opacity-75">{user.email}</p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link href={`/profile/${user._id}`} className="btn btn-light">
                            <FaPlus className="me-2" /> Ново съобщение
                        </Link>
                        <button onClick={logout} className="btn btn-outline-light" disabled={loading}>
                            Изход
                        </button>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                    <div className="stat-card bg-white rounded-3 p-3 shadow-sm text-center h-100">
                        <div className="stat-icon bg-primary text-white rounded-circle mb-2">
                            <FaEnvelope />
                        </div>
                        <h5>Общо имейли</h5>
                        <h3>{stats.totalEmails}</h3>
                    </div>
                </div>
                <div className="col-md-6 mb-3 mb-md-0">
                    <div className="stat-card bg-white rounded-3 p-3 shadow-sm text-center h-100">
                        <div className="stat-icon bg-info text-white rounded-circle mb-2">
                            <FaSms />
                        </div>
                        <h5>Общо SMS</h5>
                        <h3>{stats.totalSMS}</h3>
                    </div>
                </div>
            </div>

            <div className="card shadow border-0 rounded-3 overflow-hidden">
                <div className="card-header bg-white border-bottom-0 pt-3 pb-0">
                    <ul className="nav nav-tabs card-header-tabs">
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'email' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('email')}
                            >
                                <FaEnvelope className="me-2" /> Насрочени имейли
                                {stats.totalEmails > 0 && 
                                    <span className="badge bg-primary ms-2">{stats.totalEmails}</span>
                                }
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'sms' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('sms')}
                            >
                                <FaSms className="me-2" /> Насрочени SMS
                                {stats.totalSMS > 0 && 
                                    <span className="badge bg-primary ms-2">{stats.totalSMS}</span>
                                }
                            </button>
                        </li>
                    </ul>
                </div>
                
                <div className="card-body">
                    {activeTab === 'email' ? (
                        <>
                            {scheduledEmails.length === 0 ? (
                                <div className="empty-state text-center p-5">
                                    <div className="empty-icon mb-3">
                                        <FaEnvelope size={40} className="text-muted" />
                                    </div>
                                    <h4 className="text-muted mb-3">Няма намерени насрочени имейли</h4>
                                    <Link href={`/profile/${user._id}`} className="btn btn-primary">
                                        <FaPlus className="me-2" /> Създай първия си имейл
                                    </Link>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Тема</th>
                                                <th className="d-none d-md-table-cell">Получатели</th>
                                                <th>Насрочено за</th>
                                                <th>Статус</th>
                                                <th className="d-none d-md-table-cell">Създадено на</th>
                                                <th>Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {scheduledEmails.map((email) => (
                                                <tr key={email._id}>
                                                    <td className="fw-medium">{email.subject}</td>
                                                    <td className="d-none d-md-table-cell">
                                                        {email.recipients.length > 3 
                                                            ? `${email.recipients.slice(0, 3).join(", ")} +${email.recipients.length - 3}`
                                                            : email.recipients.join(", ")}
                                                    </td>
                                                    <td><span className="badge bg-light text-dark">{formatDate(email.scheduledDate)}</span></td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadgeClass(email.status)}`}>
                                                            {email.status}
                                                        </span>
                                                    </td>
                                                    <td className="d-none d-md-table-cell text-muted small">
                                                        {formatDate(email.createdAt)}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <EditEmailButton 
                                                                email={email} 
                                                                onUpdate={() => {
                                                                    const fetchData = async () => {
                                                                        try {
                                                                            const emailsResponse = await axios.get('/api/messages/email');
                                                                            setScheduledEmails(emailsResponse.data.data || []);
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
                                                                className="btn btn-outline-danger btn-sm"
                                                                aria-label="Delete email"
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
                        </>
                    ) : (
                        <>
                            {scheduledSMS.length === 0 ? (
                                <div className="empty-state text-center p-5">
                                    <div className="empty-icon mb-3">
                                        <FaSms size={40} className="text-muted" />
                                    </div>
                                    <h4 className="text-muted mb-3">Няма намерени насрочени SMS съобщения</h4>
                                    <Link href={`/profile/${user._id}`} className="btn btn-primary">
                                        <FaPlus className="me-2" /> Създай първото си SMS
                                    </Link>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Телефонен номер</th>
                                                <th className="d-none d-md-table-cell">Съобщение</th>
                                                <th>Насрочено за</th>
                                                <th>Статус</th>
                                                <th className="d-none d-md-table-cell">Създадено на</th>
                                                <th>Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {scheduledSMS.map((sms) => (
                                                <tr key={sms._id}>
                                                    <td className="fw-medium">{sms.phoneNumber}</td>
                                                    <td className="d-none d-md-table-cell">
                                                        {sms.message.length > 50 ? `${sms.message.substring(0, 50)}...` : sms.message}
                                                    </td>
                                                    <td><span className="badge bg-light text-dark">{formatDate(sms.scheduledDate)}</span></td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadgeClass(getStatusText(sms.status))}`}>
                                                            {getStatusText(sms.status)}
                                                        </span>
                                                    </td>
                                                    <td className="d-none d-md-table-cell text-muted small">
                                                        {formatDate(sms.createdAt)}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <EditSMSButton 
                                                                sms={sms} 
                                                                onUpdate={() => {
                                                                    const fetchSMSData = async () => {
                                                                        try {
                                                                            const smsResponse = await axios.get('/api/messages/sms');
                                                                            setScheduledSMS(smsResponse.data.scheduledSMS || []);
                                                                        } catch (error: any) {
                                                                            console.error("Error fetching data:", error);
                                                                            toast.error("Failed to refresh SMS list");
                                                                        }
                                                                    };
                                                                    fetchSMSData();
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => handleDeleteSMS(sms._id)}
                                                                disabled={deleting === sms._id}
                                                                className="btn btn-outline-danger btn-sm"
                                                                aria-label="Delete SMS"
                                                            >
                                                                {deleting === sms._id ? (
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
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}