// Overlay route renders its own <html>/<body> so OBS gets a transparent background.
// This layout exists to satisfy Next.js; the page component returns the full document.
export default function OverlayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
