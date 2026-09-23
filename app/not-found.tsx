import Link from "next/link";
export default function NotFound() {
  return <p className="empty">That episode could not be found. <Link href="/">See all episodes</Link>.</p>;
}
