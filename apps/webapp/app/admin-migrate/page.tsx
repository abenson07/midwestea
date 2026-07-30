import Link from "next/link";

const pages = [
  { href: "/admin-migrate/classes", label: "Classes" },
  { href: "/admin-migrate/students", label: "Students" },
  { href: "/admin-migrate/transactions", label: "Transactions" },
];

export default function AdminPreviewIndexPage() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "#09090b",
        color: "#f7f8f8",
        fontFamily: "inherit",
      }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Linear Kit preview</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            style={{
              color: "#828fff",
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            {page.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
