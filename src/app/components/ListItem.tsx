import Link from "next/link"
import getFormattedDate from "@/lib/getFormattedDate"

type Props = {
    post: BlogPost
}

export default function ListItem({ post }: Props) {
    const { id, title, date } = post
    const formattedDate = getFormattedDate(date)

    return (
        <li className="mb-3">
            <Link href={`/posts/${id}`} className="text-decoration-underline link-dark">
                {title}
            </Link>
            <br />
            <small className="text-muted">{formattedDate}</small>
        </li>
    )
}
