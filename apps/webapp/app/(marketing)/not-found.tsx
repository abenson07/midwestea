import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-[5%] py-24 text-center">
      <p className="mea-heading-h2 mb-4">Page not found</p>
      <p className="mb-8 max-w-md text-neutral-dark">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="rounded-mea-sm bg-text px-6 py-3 text-sm font-semibold text-background-primary"
      >
        Back to home
      </Link>
    </div>
  );
}
