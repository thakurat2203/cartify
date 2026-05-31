import Link from "next/link";
import styles from "./not-found.module.css";

/**
 * Custom 404 error page.
 * Next.js automatically renders this when a route does not match any file in the app directory.
 */
export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        {/* HTTP Status Code Display */}
        <p className={styles.code}>404</p>
        
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.description}>
          The page you are looking for does not exist or may have been moved.
        </p>

        {/* Primary Call to Action */}
        <Link href="/" className={styles.link}>
          Back to catalog
        </Link>
      </div>
    </main>
  );
}
