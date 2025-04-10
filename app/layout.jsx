import '../styles/globals.css';
import './style.css';

export const metadata = {
    title: "Qualifirst Apps",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-theme="lofi">
            <body className="antialiased">
                <div className="flex flex-col min-h-screen">
                    <div className="flex flex-col w-full max-w-5xl mx-auto grow">
                        <div className="grow">{children}</div>
                    </div>
                </div>
            </body>
        </html>
    );
}
