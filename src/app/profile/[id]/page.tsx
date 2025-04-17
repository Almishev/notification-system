"use client";
import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import './styles.css';

export default function UserProfile({params}: any) {
    const router = useRouter();
    const [messageType, setMessageType] = useState<'email' | 'SMS'>('email');
    const [email, setEmail] = useState({
        subject: "",
        message: "",
        scheduledDate: "",
        scheduledTime: ""
    });
    const [SMS, setSMS] = useState({
        phoneNumber: "",
        message: "",
        scheduledDate: "",
        scheduledTime: ""
    });
    const [recipients, setRecipients] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState("");
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateEmail = (email: string) => {
        return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    const validatePhoneNumber = (phoneNumber: string) => {
        return phoneNumber.match(/^\+[1-9]\d{1,14}$/);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addCurrentEmail();
        } else if (e.key === 'Backspace' && !currentInput && recipients.length > 0) {
            setRecipients(recipients.slice(0, -1));
        }
    };

    const addCurrentEmail = () => {
        const email = currentInput.trim();
        
        if (email && validateEmail(email) && !recipients.includes(email)) {
            setRecipients([...recipients, email]);
            setCurrentInput("");
        } else if (email && !validateEmail(email)) {
            toast.error("Невалиден имейл адрес");
        }
    };

    const handleInputBlur = () => {
        if (currentInput.trim()) {
            addCurrentEmail();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const emails = pastedText.split(/[,;\s]+/);
        
        const validEmails = emails.filter(email => {
            const trimmedEmail = email.trim();
            return trimmedEmail && validateEmail(trimmedEmail) && !recipients.includes(trimmedEmail);
        });
        
        if (validEmails.length > 0) {
            setRecipients([...recipients, ...validEmails]);
        }
    };

    const removeRecipient = (indexToRemove: number) => {
        setRecipients(recipients.filter((_, index) => index !== indexToRemove));
    };

    const focusInput = () => {
        inputRef.current?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (currentInput.trim()) {
            addCurrentEmail();
        }
        
        if (messageType === 'email') {
            if (recipients.length === 0) {
                toast.error("Моля, въведете поне един получател");
                return;
            }
            if (!email.subject || !email.message) {
                toast.error("Моля, попълнете всички полета");
                return;
            }
        } else {
            if (!SMS.phoneNumber) {
                toast.error("Моля, въведете телефонен номер");
                return;
            }
            if (!validatePhoneNumber(SMS.phoneNumber)) {
                toast.error("Моля, въведете валиден телефонен номер в международен формат (например: +359888123456)");
                return;
            }
            if (!SMS.message) {
                toast.error("Моля, въведете съобщение");
                return;
            }
        }

        try {
            setLoading(true);
            
            const scheduledDateTime = new Date(
                `${messageType === 'email' ? email.scheduledDate : SMS.scheduledDate}T${
                    messageType === 'email' ? email.scheduledTime : SMS.scheduledTime
                }`
            );
            
            if (scheduledDateTime < new Date()) {
                toast.error("Не може да се планира съобщение за миналото");
                return;
            }

            if (messageType === 'email') {
                await axios.post("/api/messages/email", {
                    recipients,
                    subject: email.subject,
                    message: email.message,
                    scheduledDate: scheduledDateTime
                });
            } else {
                await axios.post("/api/messages/sms", {
                    phoneNumber: SMS.phoneNumber,
                    message: SMS.message,
                    scheduledDate: scheduledDateTime
                });
            }
            
            toast.success(`${messageType === 'email' ? 'Имейлът' : 'SMS съобщението'} беше планирано успешно!`);
            
            if (messageType === 'email') {
                setEmail({ subject: "", message: "", scheduledDate: "", scheduledTime: "" });
                setRecipients([]);
                setCurrentInput("");
            } else {
                setSMS({ phoneNumber: "", message: "", scheduledDate: "", scheduledTime: "" });
            }
           
            router.push('/profile');
        } catch (error: any) {
            console.error("Грешка при планиране на съобщение:", error);
            toast.error(error.response?.data?.error || "Неуспешно планиране на съобщение");
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
                            <h1 className="card-title text-center mb-4">Планиране на съобщение</h1>
                            
                            <div className="btn-group w-100 mb-4" role="group">
                                <button
                                    type="button"
                                    className={`btn ${messageType === 'email' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setMessageType('email')}
                                >
                                    Имейл
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${messageType === 'SMS' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setMessageType('SMS')}
                                >
                                    SMS
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {messageType === 'email' ? (
                                    <div className="mb-3">
                                        <label htmlFor="to" className="form-label">До:</label>
                                        <div className="form-control d-flex flex-wrap gap-2 recipient-container" onClick={focusInput}>
                                            {recipients.map((recipient, index) => (
                                                <span 
                                                    key={index} 
                                                    className="badge d-flex align-items-center recipient-badge"
                                                >
                                                    {recipient}
                                                    <button
                                                        type="button"
                                                        className="btn-close ms-2 recipient-close-btn"
                                                        onClick={() => removeRecipient(index)}
                                                        aria-label="Remove recipient"
                                                    ></button>
                                                </span>
                                            ))}
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                className="border-0 flex-grow-1 min-w-120 recipient-input"
                                                value={currentInput}
                                                onChange={(e) => setCurrentInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                onBlur={handleInputBlur}
                                                onPaste={handlePaste}
                                                placeholder={recipients.length === 0 ? "Въведете имейл адреси..." : ""}
                                                aria-label="Email recipient input"
                                            />
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <small className="form-text text-muted">
                                                Натиснете Enter или запетая за да добавите имейл
                                            </small>
                                            {currentInput && (
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={addCurrentEmail}
                                                >
                                                    Добави имейл
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-3">
                                        <label htmlFor="phoneNumber" className="form-label">Телефонен номер:</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            id="phoneNumber"
                                            value={SMS.phoneNumber}
                                            onChange={(e) => setSMS({...SMS, phoneNumber: e.target.value})}
                                            placeholder="+359888123456"
                                            required
                                        />
                                        <small className="form-text text-muted">
                                            Въведете телефонен номер в международен формат (например: +359888123456)
                                        </small>
                                    </div>
                                )}

                                {messageType === 'email' && (
                                    <div className="mb-3">
                                        <label htmlFor="subject" className="form-label">Заглавие:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="subject"
                                            value={email.subject}
                                            onChange={(e) => setEmail({...email, subject: e.target.value})}
                                            placeholder="Заглавие на имейла"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="scheduledDate" className="form-label">Дата:</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="scheduledDate"
                                            value={messageType === 'email' ? email.scheduledDate : SMS.scheduledDate}
                                            onChange={(e) => messageType === 'email' 
                                                ? setEmail({...email, scheduledDate: e.target.value})
                                                : setSMS({...SMS, scheduledDate: e.target.value})}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="scheduledTime" className="form-label">Час:</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            id="scheduledTime"
                                            value={messageType === 'email' ? email.scheduledTime : SMS.scheduledTime}
                                            onChange={(e) => messageType === 'email'
                                                ? setEmail({...email, scheduledTime: e.target.value})
                                                : setSMS({...SMS, scheduledTime: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="message" className="form-label">Съобщение:</label>
                                    <textarea
                                        className="form-control"
                                        id="message"
                                        rows={6}
                                        value={messageType === 'email' ? email.message : SMS.message}
                                        onChange={(e) => messageType === 'email'
                                            ? setEmail({...email, message: e.target.value})
                                            : setSMS({...SMS, message: e.target.value})}
                                        placeholder="Вашето съобщение тук..."
                                        required
                                    />
                                    {messageType === 'SMS' && (
                                        <small className="form-text text-muted d-block mt-1">
                                            Максимален брой символи: 1600. Оставащи: {1600 - SMS.message.length}
                                        </small>
                                    )}
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? "Планирам..." : `Планирай ${messageType === 'email' ? 'имейл' : 'SMS съобщение'}`}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => router.push('/profile')}
                                    >
                                        Отказ
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
