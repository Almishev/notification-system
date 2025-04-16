import { getSortedPostsData } from "@/lib/posts"
import Link from "next/link"
import { FaCalendarAlt, FaArrowRight } from "react-icons/fa"

interface Post {
    id: string
    title: string
    date: string
    excerpt?: string
}

export default function Posts() {
    const posts = getSortedPostsData()

    return (
        <section>
            <div className="row g-4">
                {posts.map(post => (
                    <div key={post.id} className="col-md-6 col-lg-4 mb-4">
                        <PostCard post={post} />
                    </div>
                ))}
            </div>
        </section>
    )
}

function PostCard({ post }: { post: Post }) {
    const { id, title, date, excerpt = "Прочетете повече за тази тема в нашия блог..." } = post;
    
    const formattedDate = new Date(date).toLocaleDateString('bg-BG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Проверяваме за изображение, използваме резервно изображение ако няма специфично за поста
    const backgroundImageStyle = {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(/next.svg)`
    };

    return (
        <div className="post-card">
            <div 
                className="post-card-img" 
                style={backgroundImageStyle}
            ></div>
            <div className="post-card-content">
                <div className="post-card-date">
                    <FaCalendarAlt className="me-2" />
                    {formattedDate}
                </div>
                <h3 className="post-card-title">{title}</h3>
                <p className="post-card-excerpt">{excerpt}</p>
                <Link href={`/posts/${id}`} className="btn btn-outline-primary post-card-link">
                    Прочети статията <FaArrowRight className="ms-2" />
                </Link>
            </div>
        </div>
    )
}
