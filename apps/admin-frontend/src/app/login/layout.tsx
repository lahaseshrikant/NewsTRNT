// Login page should not use the protected admin layout
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


