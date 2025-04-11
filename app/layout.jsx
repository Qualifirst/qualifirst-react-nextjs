import '../styles/globals.css';

export const metadata = {
    title: "Qualifirst Apps",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-theme="lofi">
            <body className="antialiased">
                <div className="flex flex-col min-h-screen px-6 sm:px-12">
                    <div className="flex flex-col w-full max-w-5xl mx-auto grow">
                        <div className="grow">{children}</div>
                    </div>
                </div>
            </body>
        </html>
    );
}
