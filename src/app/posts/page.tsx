import Posts from '../components/Posts';
import "./blog.css";
import { FaRss } from 'react-icons/fa';

export default function BlogPage() {
    return (
        <main>
            <div className="container py-5">
                <div className="blog-header mb-5">
                    <FaRss className="mb-3" size={40} />
                    <h1>Блог</h1>
                    <p>Научете повече за ефективно управление на известията и как нашата система може да помогне на вашия бизнес</p>
                </div>
                
                <div className="row">
                    <div className="col-lg-8 mx-auto">
                        <Posts />
                    </div>
                </div>
            </div>
        </main>
    );
}