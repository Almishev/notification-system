import Link from 'next/link';

// Стил за футъра с градиент
const footerStyle = {
    background: 'linear-gradient(135deg, #2b2b2b 0%, #000000 100%);'
};

const Footer = () => {
    return (
        <footer className="text-light py-5 mt-auto" style={footerStyle}>
            <div className="container">
                <div className="row g-4">
                    <div className="col-md-4">
                        <h5 className="mb-3 fw-bold">Система за известяване</h5>
                        <p className="text-light-emphasis mb-4">
                        Планирайте и управлявайте ефективно вашите имейл/SMS известия.
                        </p>
                        <div className="d-flex gap-3">
                            <a 
                                href="https://facebook.com" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-light fs-4 hover-opacity-75 transition-opacity"
                                title="Facebook"
                            >
                                <i className="bi bi-facebook"></i>
                            </a>
                            <a 
                                href="https://linkedin.com" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-light fs-4 hover-opacity-75 transition-opacity"
                                title="LinkedIn"
                            >
                                <i className="bi bi-linkedin"></i>
                            </a>
                        </div>
                    </div>
                    
                    <div className="col-md-4">
                        <h5 className="mb-3 fw-bold">Полезни връзки</h5>
                        <div className="d-flex flex-column gap-2">
                            <Link 
                                href="/privacy-policy" 
                                className="text-light text-decoration-none hover-opacity-75 transition-opacity"
                            >
                                <i className="bi bi-shield-check me-2"></i>
                                Политика за поверителност
                            </Link>
                            <Link 
                                href="/terms" 
                                className="text-light text-decoration-none hover-opacity-75 transition-opacity"
                            >
                                <i className="bi bi-file-text me-2"></i>
                                Условия за ползване
                            </Link>
                        </div>
                    </div>
                    
                    <div className="col-md-4">
                        <h5 className="mb-3 fw-bold">Контакти</h5>
                        <div className="d-flex flex-column gap-2">
                            <a 
                                href="mailto:support@emailreminder.com" 
                                className="text-light text-decoration-none hover-opacity-75 transition-opacity"
                            >
                                <i className="bi bi-envelope me-2"></i>
                                support@emailreminder.com
                            </a>
                            <a 
                                href="tel:+1234567890" 
                                className="text-light text-decoration-none hover-opacity-75 transition-opacity"
                            >
                                <i className="bi bi-telephone me-2"></i>
                                +1 (234) 567-890
                            </a>
                        </div>
                    </div>
                </div>
                
                <hr className="my-4 border-secondary" />
                
                <div className="row">
                    <div className="col-12 text-center">
                        <p className="mb-0 text-light-emphasis">
                            &copy; {new Date().getFullYear()} Система за планирано изпращане на съобщения. Всички права запазени.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;