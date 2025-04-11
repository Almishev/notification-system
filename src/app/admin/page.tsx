'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    username: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
    emailCount: number;
}

interface Email {
    _id: string;
    recipients: string[];
    subject: string;
    message: string;
    scheduledDate: string;
    status: string;
    createdBy: string;
}

export default function AdminPanel() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [registeredEmails, setRegisteredEmails] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [usersResponse, emailsResponse] = await Promise.all([
                axios.get('/api/admin/users'),
                axios.get('/api/admin/emails')
            ]);
            
            const emailMap: { [key: string]: boolean } = {};
            usersResponse.data.users.forEach((user: User) => {
                emailMap[user.email] = true;
            });
            const uniqueEmails = Object.keys(emailMap);
            
            setUsers(usersResponse.data.users);
            setEmails(emailsResponse.data.emails);
            setRegisteredEmails(uniqueEmails);
        } catch (error: any) {
            toast.error('Неуспешно зареждане на данни');
        } finally {
            setLoading(false);
        }
    }, []);

    const checkAdminAndLoadData = useCallback(async () => {
        try {
            const userResponse = await axios.get('/api/users/me');
            if (!userResponse.data.data.isAdmin) {
                toast.error('Неоторизиран достъп');
                router.push('/profile');
                return;
            }
            await loadData();
        } catch (error) {
            toast.error('Моля, влезте като администратор');
            router.push('/login');
        }
    }, [router, loadData]);

    useEffect(() => {
        checkAdminAndLoadData();
    }, [checkAdminAndLoadData]);

    const handleAdminStatusChange = async (userId: string, isAdmin: boolean) => {
        try {
            await axios.put(`/api/admin/users/${userId}`, { isAdmin });
            toast.success('Статусът на потребителя е актуализиран успешно');
            await loadData();
        } catch (error) {
            toast.error('Неуспешно обновяване на статуса на потребителя');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Сигурни ли сте, че искате да изтриете този потребител?')) {
            try {
                await axios.delete(`/api/admin/users/${userId}`);
                toast.success('Потребителят е изтрит успешно');
                await loadData();
            } catch (error) {
                toast.error('Неуспешно изтриване на потребителя');
            }
        }
    };

    const handleDeleteEmail = async (emailId: string) => {
        if (window.confirm('Сигурни ли сте, че искате да изтриете този имейл?')) {
            try {
                await axios.delete(`/api/admin/emails/${emailId}`);
                toast.success('Имейлът е изтрит успешно');
                await loadData();
            } catch (error) {
                toast.error('Неуспешно изтриване на имейл');
            }
        }
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Зареждане...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-5">
            <div className="row">
                <div className="col-12">
                    <h1 className="mb-4">Админ панел</h1>
                    
                    <ul className="nav nav-tabs mb-4 flex-nowrap overflow-auto">
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                                onClick={() => setActiveTab('users')}
                            >
                                Управление на потребители
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'emails' ? 'active' : ''}`}
                                onClick={() => setActiveTab('emails')}
                            >
                                Мониторинг на имейли
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'registered' ? 'active' : ''}`}
                                onClick={() => setActiveTab('registered')}
                            >
                                Регистрирани имейли
                            </button>
                        </li>
                    </ul>

                    <div className="card">
                        <div className="card-body">
                            {activeTab === 'users' && (
                                <>
                                    <h2 className="card-title mb-4">Потребители</h2>
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Потребителско име</th>
                                                    <th>Имейл</th>
                                                    <th>Брой имейли</th>
                                                    <th>Администраторски статус</th>
                                                    <th>Дата на създаване</th>
                                                    <th>Действия</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map(user => (
                                                    <tr key={user._id}>
                                                        <td>{user.username}</td>
                                                        <td>{user.email}</td>
                                                        <td>
                                                            <span className="badge bg-primary">
                                                                {user.emailCount}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="form-check form-switch">
                                                                <label htmlFor={`admin-toggle-${user._id}`} className="form-check-label">
                                                                    {user.isAdmin ? 'Администратор' : 'Потребител'}
                                                                </label>
                                                                <input
                                                                    id={`admin-toggle-${user._id}`}
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    checked={user.isAdmin}
                                                                    onChange={(e) => handleAdminStatusChange(user._id, e.target.checked)}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleDeleteUser(user._id)}
                                                            >
                                                                Изтрий
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {activeTab === 'emails' && (
                                <>
                                    <h2 className="card-title mb-4">Планирани имейли</h2>
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Предмет</th>
                                                    <th>Получатели</th>
                                                    <th>Статус</th>
                                                    <th>Планирана дата</th>
                                                    <th>Създадено от</th>
                                                    <th>Действия</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {emails.map(email => (
                                                    <tr key={email._id}>
                                                        <td>{email.subject}</td>
                                                        <td>{email.recipients.join(', ')}</td>
                                                        <td>
                                                            <span className={`badge ${
                                                                email.status === 'sent' ? 'bg-success' :
                                                                email.status === 'failed' ? 'bg-danger' :
                                                                'bg-warning'
                                                            }`}>
                                                                {email.status}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(email.scheduledDate).toLocaleString()}</td>
                                                        <td>{email.createdBy}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleDeleteEmail(email._id)}
                                                            >
                                                                Изтрий
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {activeTab === 'registered' && (
                                <>
                                    <h2 className="card-title mb-4">Регистрирани имейли</h2>
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Имейл адрес</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {registeredEmails.map((email, index) => (
                                                    <tr key={email}>
                                                        <td>{index + 1}</td>
                                                        <td>{email}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
