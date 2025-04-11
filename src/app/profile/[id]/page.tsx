"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
// Removed inline styles and moved them to an external CSS file


export default function UserProfile({params}: any) {
    const router = useRouter();
    const [email, setEmail] = useState({
        subject: "",
        message: "",
        scheduledDate: "",
        scheduledTime: ""
    });
    const [recipients, setRecipients] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState("");
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => {
        return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const email = currentInput.trim();
            
            if (email && validateEmail(email) && !recipients.includes(email)) {
                setRecipients([...recipients, email]);
                setCurrentInput("");
            } else if (email && !validateEmail(email)) {
                toast.error("Невалиден имейл адрес");
            }
        } else if (e.key === 'Backspace' && !currentInput && recipients.length > 0) {
            setRecipients(recipients.slice(0, -1));
        }
    };

    const removeRecipient = (indexToRemove: number) => {
        setRecipients(recipients.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (recipients.length === 0) {
            toast.error("Моля, въведете поне един получател");
            return;
        }

        try {
            setLoading(true);
            
            const scheduledDateTime = new Date(`${email.scheduledDate}T${email.scheduledTime}`);
            
            if (scheduledDateTime < new Date()) {
                toast.error("Не може да се планира имейл за миналото");
                return;
            }

            const response = await axios.post("/api/email/schedule", {
                recipients,
                subject: email.subject,
                message: email.message,
                scheduledDate: scheduledDateTime
            });
            
            toast.success("Имейлът беше планиран успешно!");
            
            setEmail({ subject: "", message: "", scheduledDate: "", scheduledTime: "" });
            setRecipients([]);
            setCurrentInput("");
           
            router.push('/profile');
        } catch (error: any) {
            console.error("Грешка при планиране на имейл:", error);
            toast.error(error.response?.data?.error || "Неуспешно планиране на имейл");
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
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="to" className="form-label">До:</label>
                                    <div className="form-control recipientsContainer">
                                        {recipients.map((recipient, index) => (
                                            <span 
                                                key={index} 
                                                className="badge badge-dark-yellow d-flex align-items-center"
                                            >
                                                {recipient}
                                                <button
                                                    type="button"
                                                    className="btn-close ms-2"
                                                    onClick={() => removeRecipient(index)}
                                                    aria-label="Remove"
                                                ></button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            className="border-0 flex-grow-1 min-w-[120px] input-no-outline"
                                            value={currentInput}
                                            onChange={(e) => setCurrentInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder={recipients.length === 0 ? "Въведете имейл адреси..." : ""}
                                        />
                                    </div>
                                    <small className="form-text text-muted">
                                        Натиснете Enter или запетая за да добавите имейл
                                    </small>
                                </div>
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
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="scheduledDate" className="form-label">Дата:</label>
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
                                        <label htmlFor="scheduledTime" className="form-label">Час:</label>
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
                                    <label htmlFor="message" className="form-label">Съобщение:</label>
                                    <textarea
                                        className="form-control"
                                        id="message"
                                        rows={6}
                                        value={email.message}
                                        onChange={(e) => setEmail({...email, message: e.target.value})}
                                        placeholder="Вашето съобщение тук..."
                                        required
                                    />
                                </div>
                                <div className="d-grid gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-dark"
                                        disabled={loading}
                                    >
                                        {loading ? "Планирам..." : "Планирай имейл"}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
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
