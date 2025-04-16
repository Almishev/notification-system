import getFormattedDate from "@/lib/getFormattedDate"
import { getSortedPostsData, getPostData } from "@/lib/posts"
import { notFound } from "next/navigation"
import Link from "next/link"

export function generateStaticParams() {
    const posts = getSortedPostsData()

    return posts.map((post) => ({
        postId: post.id
    }))
}

export function generateMetadata({ params }: { params: { postId: string } }) {
    const posts = getSortedPostsData()
    const { postId } = params

    const post = posts.find(post => post.id === postId)

    if (!post) {
        return {
            title: 'Системата за известие не намира такъв пост'
        }
    }

    return {
        title: post.title,
    }
}

export default async function Post({ params }: { params: { postId: string } }) {
    const posts = getSortedPostsData()
    const { postId } = params

    if (!posts.find(post => post.id === postId)) notFound()

    const { title, date, contentHtml } = await getPostData(postId)
    const pubDate = getFormattedDate(date)

    return (
        <main className="container py-5">
            <h1 className="display-5 mb-3">{title}</h1>
            <p className="text-muted mb-4">{pubDate}</p>
            <article>
                <section 
                    className="mb-4"
                    dangerouslySetInnerHTML={{ __html: contentHtml }} 
                />
                <Link href="/" className="btn btn-link px-0">
                    ← Обратно в началото
                </Link>
            </article>
        </main>
    )
}
