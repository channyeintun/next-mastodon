export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="auth-layout">
            {children}
        </main>
    );
}
