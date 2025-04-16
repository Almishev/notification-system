"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import "../auth.css";

export default function SignupPage() {
    const router = useRouter();
    const [user, setUser] = React.useState({
        email: "",
        password: "",
        username: "",
    });
    const [buttonDisabled, setButtonDisabled] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const onSignup = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/signup", user);
            console.log("Успешна регистрация", response.data);
            router.push("/login");
        } catch (error: any) {
            console.log("Неуспешна регистрация", error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user.email.length > 0 && user.password.length > 0 && user.username.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-card-header">
                    <h1>{loading ? "Обработва се..." : "Регистрация"}</h1>
                    <p>Създайте акаунт за управление на вашите съобщения</p>
                </div>
                <div className="auth-card-body">
                    <form>
                        <div className="auth-input-group">
                            <label htmlFor="username">Потребителско име</label>
                            <input
                                id="username"
                                type="text"
                                value={user.username}
                                onChange={(e) => setUser({ ...user, username: e.target.value })}
                                placeholder="Въведете потребителско име"
                            />
                            <span className="input-icon"><FaUser /></span>
                        </div>
                        <div className="auth-input-group">
                            <label htmlFor="email">Имейл</label>
                            <input
                                id="email"
                                type="email"
                                value={user.email}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                                placeholder="Въведете имейл"
                            />
                            <span className="input-icon"><FaEnvelope /></span>
                        </div>
                        <div className="auth-input-group">
                            <label htmlFor="password">Парола</label>
                            <div className="position-relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={user.password}
                                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                                    placeholder="Въведете парола"
                                />
                                <button
                                    type="button"
                                    className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    style={{ right: "10px", zIndex: 10 }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                                <span className="input-icon" style={{ right: "40px" }}><FaLock /></span>
                            </div>
                        </div>
                        <button
                            onClick={onSignup}
                            disabled={buttonDisabled || loading}
                            type="button"
                            className="auth-submit-button"
                        >
                            {loading ? "Създаване на акаунт..." : "Регистрация"}
                        </button>
                        <div className="auth-links">
                            <span>Вече имате акаунт? </span>
                            <Link href="/login">
                                Влезте
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
