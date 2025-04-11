import { getSortedPostsData } from "@/lib/posts"
import ListItem from "./ListItem"

export default function Posts() {
    const posts = getSortedPostsData()

    return (
        <section className="container mt-5">
            <h2 className="display-4 fw-bold mb-4">Blog</h2>
            <ul className="list-unstyled">
                {posts.map(post => (
                    <ListItem key={post.id} post={post} />
                ))}
            </ul>
        </section>
    )
}
