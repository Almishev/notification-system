"use client";
import Link from "next/link";
import React, {useEffect} from "react";
import {useRouter} from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
        <div className="container">
            <div className="row justify-content-center align-items-center min-vh-100">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow">
                        <div className="card-body">
                            <h1 className="text-center mb-4">{loading ? "Обработва се..." : "Влизане"}</h1>
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Имейл</label>
                                    <input 
                                        className="form-control"
                                        id="email"
                                        type="email"
                                        value={user.email}
                                        onChange={(e) => setUser({...user, email: e.target.value})}
                                        placeholder="Въведете имейл"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Парола</label>
                                    <div className="input-group">
                                        <input 
                                            className="form-control"
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={user.password}
                                            onChange={(e) => setUser({...user, password: e.target.value})}
                                            placeholder="Въведете парола"
                                        />
                                        <button 
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={onLogin}
                                    disabled={buttonDisabled}
                                    type="button"
                                    className="btn btn-dark w-100 mb-3"
                                >
                                    {loading ? "Влизам..." : "Влизане"}
                                </button>
                                <div className="text-center">
                                    <Link href="/signup" className="text-decoration-none">
                                        Нямате акаунт? Регистрирайте се
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
