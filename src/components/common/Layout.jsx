import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { Toaster } from 'react-hot-toast';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}