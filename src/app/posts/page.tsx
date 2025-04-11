import Posts from '../components/Posts';

export default function BlogPage() {
    return (
        <main className="container py-5">
            <h1 className="display-4 mb-4">Блог</h1>
            <Posts />
        </main>
    );
}