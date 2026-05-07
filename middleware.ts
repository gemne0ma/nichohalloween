// Empty middleware. Auth is enforced in app/admin/layout.tsx instead,
// because Clerk's middleware imports use Node.js modules (crypto, devBrowser)
// that are not available in Vercel's Edge runtime.
export default function middleware() {}
export const config = { matcher: [] };
