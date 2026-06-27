import Link from "next/link";
import { notFoundStyles as styles } from "@/lib/tailwind-styles";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code}>404</p>

        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.description}>
          The page you are looking for does not exist or may have been moved.
        </p>

        <Link href="/" className={styles.link}>
          Back to catalog
        </Link>
      </div>
    </main>
  );
}
