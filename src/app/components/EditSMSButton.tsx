import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaEdit } from 'react-icons/fa';

interface SMS {
    _id: string;
    phoneNumber: string;
    message: string;
    scheduledDate: string;
    status: string;
}

interface EditSMSButtonProps {
    sms: SMS;
    onUpdate: () => void;
}

const EditSMSButton: React.FC<EditSMSButtonProps> = ({ sms, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        phoneNumber: sms.phoneNumber,
        message: sms.message,
        scheduledDate: new Date(sms.scheduledDate).toISOString().slice(0, 16)
    });

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate phone number
            if (!/^\+[1-9]\d{1,14}$/.test(formData.phoneNumber)) {
                toast.error('Please enter a valid phone number in international format');
                setLoading(false);
                return;
            }

            // Validate message length
            if (formData.message.length > 1600) {
                toast.error('SMS message cannot exceed 1600 characters');
                setLoading(false);
                return;
            }

            const response = await axios.put('/api/messages/sms', {
                smsId: sms._id,
                phoneNumber: formData.phoneNumber,
                message: formData.message,
                scheduledDate: formData.scheduledDate
            });

            if (response.data.success) {
                toast.success('SMS updated successfully');
                setIsEditing(false);
                onUpdate();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error updating SMS');
        } finally {
            setLoading(false);
        }
    };

    if (!isEditing) {
        return (
            <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary btn-sm"
                disabled={sms.status !== 'pending'}
                aria-label="Edit SMS"
            >
                <FaEdit />
            </button>
        );
    }

    return (
        <div className="modal show d-block modal-overlay">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit SMS</h5>
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
                                <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                                <input
                                    id="phoneNumber"
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="form-control"
                                    placeholder="+359888123456"
                                    aria-describedby="phoneNumberHelp"
                                />
                                <div id="phoneNumberHelp" className="form-text">Enter phone number in international format</div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="message" className="form-label">Message</label>
                                <textarea
                                    id="message"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={4}
                                    className="form-control"
                                    maxLength={1600}
                                />
                                <div className="form-text">
                                    Characters remaining: {1600 - formData.message.length}/1600
                                </div>
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
                                    ) : 'Update SMS'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditSMSButton;