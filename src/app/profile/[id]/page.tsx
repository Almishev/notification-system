"use client";
import { useState, useRef, useEffect } from "react";
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
        message: "",
        scheduledDate: "",
        scheduledTime: ""
    });
    const [recipients, setRecipients] = useState<string[]>([]);
    const [phoneRecipients, setPhoneRecipients] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState("");
    const [currentPhoneInput, setCurrentPhoneInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const phoneContainerRef = useRef<HTMLDivElement>(null);

    // Определяне дали устройството е мобилно
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent.toLowerCase();
            const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i;
            setIsMobile(mobileRegex.test(userAgent) || window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const validateEmail = (email: string) => {
        return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    const validatePhoneNumber = (phoneNumber: string) => {
        return phoneNumber.match(/^\+[1-9]\d{1,14}$/);
    };

    // Функция за добавяне на имейл към списъка с получатели
    const addCurrentEmail = () => {
        if (!currentInput.trim()) return;
        
        const email = currentInput.trim();
        
        if (validateEmail(email) && !recipients.includes(email)) {
            setRecipients(prevRecipients => [...prevRecipients, email]);
            setCurrentInput("");
            
            // Фокусираме отново върху полето за въвеждане
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        } else if (!validateEmail(email)) {
            toast.error("Невалиден имейл адрес");
        } else if (recipients.includes(email)) {
            toast.error("Този имейл вече е добавен");
            setCurrentInput("");
        }
    };

    // Функция за добавяне на телефонен номер към списъка с получатели
    const addCurrentPhoneNumber = () => {
        if (!currentPhoneInput.trim()) return;
        
        const phoneNumber = currentPhoneInput.trim();
        
        if (validatePhoneNumber(phoneNumber) && !phoneRecipients.includes(phoneNumber)) {
            setPhoneRecipients(prevPhoneRecipients => [...prevPhoneRecipients, phoneNumber]);
            setCurrentPhoneInput("");
            
            // Фокусираме отново върху полето за въвеждане
            setTimeout(() => {
                phoneInputRef.current?.focus();
            }, 0);
        } else if (!validatePhoneNumber(phoneNumber)) {
            toast.error("Невалиден телефонен номер. Използвайте международен формат (напр. +359888123456)");
        } else if (phoneRecipients.includes(phoneNumber)) {
            toast.error("Този телефонен номер вече е добавен");
            setCurrentPhoneInput("");
        }
    };

    // Функция за изтриване на имейл от списъка с получатели
    const removeRecipient = (indexToRemove: number) => {
        setRecipients(recipients.filter((_, index) => index !== indexToRemove));
        // Фокусираме върху полето за въвеждане при премахване на получател
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    // Функция за изтриване на телефонен номер от списъка с получатели
    const removePhoneRecipient = (indexToRemove: number) => {
        setPhoneRecipients(phoneRecipients.filter((_, index) => index !== indexToRemove));
        // Фокусираме върху полето за въвеждане при премахване на получател
        setTimeout(() => {
            phoneInputRef.current?.focus();
        }, 0);
    };

    // Функция за обработка на клавиатурни събития за имейли
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && currentInput.trim()) {
            e.preventDefault();
            addCurrentEmail();
        } else if (e.key === 'Backspace' && !currentInput && recipients.length > 0) {
            // При натискане на Backspace в празно поле премахваме последния имейл
            setRecipients(prev => prev.slice(0, -1));
        }
    };

    // Функция за обработка на клавиатурни събития за телефонни номера
    const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && currentPhoneInput.trim()) {
            e.preventDefault();
            addCurrentPhoneNumber();
        } else if (e.key === 'Backspace' && !currentPhoneInput && phoneRecipients.length > 0) {
            // При натискане на Backspace в празно поле премахваме последния телефонен номер
            setPhoneRecipients(prev => prev.slice(0, -1));
        }
    };

    // Функция за обработка на paste събития за имейли
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        
        // Проверяваме дали поставеният текст съдържа запетая или нов ред
        if (pastedText.includes(',') || pastedText.includes(';') || pastedText.includes('\n')) {
            // Разделяме текста на отделни имейли
            const potentialEmails = pastedText.split(/[,;\n]+/).map(email => email.trim()).filter(Boolean);
            
            // Филтрираме валидните имейли
            const validEmails = potentialEmails.filter(email => {
                return validateEmail(email) && !recipients.includes(email);
            });
            
            if (validEmails.length > 0) {
                // Добавяме валидните имейли към списъка с получатели
                setRecipients(prevRecipients => [...prevRecipients, ...validEmails]);
                toast.success(`Добавени ${validEmails.length} имейла`);
            } else {
                // Ако няма валидни имейли, добавяме текста към текущото поле
                setCurrentInput(prev => prev + pastedText);
            }
        } else {
            // Ако поставеният текст не съдържа разделители, третираме го като един имейл
            setCurrentInput(prev => prev + pastedText);
        }
    };

    // Функция за обработка на paste събития за телефонни номера
    const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        
        // Проверяваме дали поставеният текст съдържа запетая или нов ред
        if (pastedText.includes(',') || pastedText.includes(';') || pastedText.includes('\n')) {
            // Разделяме текста на отделни телефонни номера
            const potentialPhones = pastedText.split(/[,;\n]+/).map(phone => phone.trim()).filter(Boolean);
            
            // Филтрираме валидните телефонни номера
            const validPhones = potentialPhones.filter(phone => {
                return validatePhoneNumber(phone) && !phoneRecipients.includes(phone);
            });
            
            if (validPhones.length > 0) {
                // Добавяме валидните телефонни номера към списъка с получатели
                setPhoneRecipients(prevPhoneRecipients => [...prevPhoneRecipients, ...validPhones]);
                toast.success(`Добавени ${validPhones.length} телефонни номера`);
            } else {
                // Ако няма валидни телефонни номера, добавяме текста към текущото поле
                setCurrentPhoneInput(prev => prev + pastedText);
            }
        } else {
            // Ако поставеният текст не съдържа разделители, третираме го като един телефонен номер
            setCurrentPhoneInput(prev => prev + pastedText);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (messageType === 'email') {
            // Добавяме недовършения имейл, ако има такъв
            if (currentInput.trim() && validateEmail(currentInput.trim())) {
                addCurrentEmail();
            }
            
            if (recipients.length === 0) {
                toast.error("Моля, въведете поне един получател");
                return;
            }
            
            if (!email.subject || !email.message || !email.scheduledDate || !email.scheduledTime) {
                toast.error("Моля, попълнете всички полета");
                return;
            }
        } else {
            // Добавяме недовършения телефонен номер, ако има такъв
            if (currentPhoneInput.trim() && validatePhoneNumber(currentPhoneInput.trim())) {
                addCurrentPhoneNumber();
            }
            
            if (phoneRecipients.length === 0) {
                toast.error("Моля, въведете поне един телефонен номер");
                return;
            }
            
            if (!SMS.message || !SMS.scheduledDate || !SMS.scheduledTime) {
                toast.error("Моля, попълнете всички полета");
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
                setLoading(false);
                return;
            }

            if (messageType === 'email') {
                await axios.post("/api/messages/email", {
                    recipients,
                    subject: email.subject,
                    message: email.message,
                    scheduledDate: scheduledDateTime
                });
                toast.success("Имейлът беше планиран успешно!");
            } else {
                await axios.post("/api/messages/sms", {
                    phoneNumbers: phoneRecipients,
                    message: SMS.message,
                    scheduledDate: scheduledDateTime
                });
                toast.success("SMS съобщението беше планирано успешно!");
            }
            
            // Reset form
            if (messageType === 'email') {
                setEmail({ subject: "", message: "", scheduledDate: "", scheduledTime: "" });
                setRecipients([]);
                setCurrentInput("");
            } else {
                setSMS({ message: "", scheduledDate: "", scheduledTime: "" });
                setPhoneRecipients([]);
                setCurrentPhoneInput("");
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
                                {messageType === 'email' && (
                                    <div className="mb-3">
                                        <label htmlFor="to" className="form-label">До:</label>
                                        <div ref={containerRef} className="input-group mb-1">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                className="form-control"
                                                placeholder="Въведете имейл"
                                                value={currentInput}
                                                onChange={(e) => setCurrentInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                onPaste={handlePaste}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary"
                                                onClick={addCurrentEmail}
                                                disabled={!currentInput.trim() || !validateEmail(currentInput.trim())}
                                            >
                                                Добави
                                            </button>
                                        </div>
                                        
                                        <div className="form-control d-flex flex-wrap gap-2 recipient-container mt-2">
                                            {recipients.length === 0 && (
                                                <span className="text-muted w-100 text-center pt-2">
                                                    Няма добавени имейли
                                                </span>
                                            )}
                                            
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
                                        </div>
                                        
                                        <div className="d-flex justify-content-between align-items-center mt-1">
                                            <small className="form-text text-muted">
                                                {isMobile ? 
                                                    'Въведете имейл и натиснете "Добави"' : 
                                                    'Натиснете Enter или запетая за да добавите имейл'
                                                }
                                            </small>
                                            <small className="form-text text-muted">
                                                {recipients.length} {recipients.length === 1 ? 'получател' : 'получатели'}
                                            </small>
                                        </div>
                                    </div>
                                )}

                                {messageType === 'SMS' && (
                                    <div className="mb-3">
                                        <label htmlFor="phoneNumber" className="form-label">Телефонен номер:</label>
                                        <div ref={phoneContainerRef} className="input-group mb-1">
                                            <input
                                                ref={phoneInputRef}
                                                type="tel"
                                                className="form-control"
                                                id="phoneNumber"
                                                value={currentPhoneInput}
                                                onChange={(e) => setCurrentPhoneInput(e.target.value)}
                                                onKeyDown={handlePhoneKeyDown}
                                                onPaste={handlePhonePaste}
                                                placeholder="+359888123456"
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary"
                                                onClick={addCurrentPhoneNumber}
                                                disabled={!currentPhoneInput.trim() || !validatePhoneNumber(currentPhoneInput.trim())}
                                            >
                                                Добави
                                            </button>
                                        </div>
                                        
                                        <div className="form-control d-flex flex-wrap gap-2 recipient-container mt-2">
                                            {phoneRecipients.length === 0 && (
                                                <span className="text-muted w-100 text-center pt-2">
                                                    Няма добавени телефонни номера
                                                </span>
                                            )}
                                            
                                            {phoneRecipients.map((phoneNumber, index) => (
                                                <span 
                                                    key={index} 
                                                    className="badge d-flex align-items-center recipient-badge"
                                                >
                                                    {phoneNumber}
                                                    <button
                                                        type="button"
                                                        className="btn-close ms-2 recipient-close-btn"
                                                        onClick={() => removePhoneRecipient(index)}
                                                        aria-label="Remove phone number"
                                                    ></button>
                                                </span>
                                            ))}
                                        </div>
                                        
                                        <div className="d-flex justify-content-between align-items-center mt-1">
                                            <small className="form-text text-muted">
                                                {isMobile ? 
                                                    'Въведете телефонен номер и натиснете "Добави"' : 
                                                    'Натиснете Enter или запетая за да добавите номер'
                                                }
                                            </small>
                                            <small className="form-text text-muted">
                                                {phoneRecipients.length} {phoneRecipients.length === 1 ? 'получател' : 'получатели'}
                                            </small>
                                        </div>
                                        <small className="form-text text-muted d-block mt-1">
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
                                    <div className="col-md-6 mb-2 mb-md-0">
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
