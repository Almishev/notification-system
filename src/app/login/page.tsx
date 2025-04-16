"use client";
import Link from "next/link";
import React, {useEffect} from "react";
import {useRouter} from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import "../auth.css";

export default function LoginPage() {
    const router = useRouter();
    const [user, setUser] = React.useState({
        email: "",
        password: "",
    });
    const [buttonDisabled, setButtonDisabled] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const onLogin = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/login", user);
            console.log("Успешно влизане", response.data);
            toast.success("Успешно влизане");
            router.push("/profile");
        } catch (error:any) {
            console.log("Неуспешно влизане", error.message);
            toast.error(error.message);
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        if(user.email.length > 0 && user.password.length > 0) {
            setButtonDisabled(false);
        } else{
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
                    <h1>{loading ? "Обработва се..." : "Влизане"}</h1>
                    <p>Влезте в своя акаунт, за да управлявате съобщенията си</p>
                </div>
                <div className="auth-card-body">
                    <form>
                        <div className="auth-input-group">
                            <label htmlFor="email">Имейл</label>
                            <input 
                                id="email"
                                type="email"
                                value={user.email}
                                onChange={(e) => setUser({...user, email: e.target.value})}
                                placeholder="Въведете вашия имейл"
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
                                    onChange={(e) => setUser({...user, password: e.target.value})}
                                    placeholder="Въведете вашата парола"
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
                            onClick={onLogin}
                            disabled={buttonDisabled || loading}
                            type="button"
                            className="auth-submit-button"
                        >
                            {loading ? "Влизам..." : "Влизане"}
                        </button>
                        <div className="auth-links">
                            <span>Нямате акаунт? </span>
                            <Link href="/signup">
                                Регистрирайте се
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
