import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaEdit } from 'react-icons/fa';

interface Email {
    _id: string;
    recipients: string[];
    subject: string;
    message: string;
    scheduledDate: string;
    status: string;
}

interface EditEmailButtonProps {
    email: Email;
    onUpdate: () => void;
}

const EditEmailButton: React.FC<EditEmailButtonProps> = ({ email, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        recipients: email.recipients.join(', '),
        subject: email.subject,
        message: email.message,
        scheduledDate: new Date(email.scheduledDate).toISOString().slice(0, 16)
    });

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.put('/api/email/edit', {
                emailId: email._id,
                recipients: formData.recipients.split(',').map(email => email.trim()),
                subject: formData.subject,
                message: formData.message,
                scheduledDate: formData.scheduledDate
            });

            if (response.data.success) {
                toast.success('Email updated successfully');
                setIsEditing(false);
                onUpdate();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error updating email');
        } finally {
            setLoading(false);
        }
    };

    if (!isEditing) {
        return (
            <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary btn-sm"
                disabled={email.status !== 'pending'}
                aria-label="Edit email"
            >
                <FaEdit />
            </button>
        );
    }

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit Email</h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setIsEditing(false)} 
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleEdit}>
                            <div className="mb-3">
                                <label htmlFor="recipients" className="form-label">Recipients</label>
                                <input
                                    id="recipients"
                                    type="text"
                                    value={formData.recipients}
                                    onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                                    className="form-control"
                                    placeholder="email@example.com, another@example.com"
                                    aria-describedby="recipientsHelp"
                                />
                                <div id="recipientsHelp" className="form-text">Separate multiple email addresses with commas</div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="subject" className="form-label">Subject</label>
                                <input
                                    id="subject"
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="form-control"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="message" className="form-label">Message</label>
                                <textarea
                                    id="message"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={4}
                                    className="form-control"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="scheduledDate" className="form-label">Scheduled Date</label>
                                <input
                                    id="scheduledDate"
                                    type="datetime-local"
                                    value={formData.scheduledDate}
                                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                    className="form-control"
                                />
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary"
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Updating...
                                        </>
                                    ) : 'Update Email'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditEmailButton;