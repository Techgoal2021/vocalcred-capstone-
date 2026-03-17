export default function NotFound() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>VocalCred: The page you are looking for does not exist.</p>
      <a href="/dashboard" style={{ color: '#2563eb', textDecoration: 'underline' }}>
        Return to Dashboard
      </a>
    </div>
  );
}
