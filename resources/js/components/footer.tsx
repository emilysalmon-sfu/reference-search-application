import sfuBusinessLogo from '@/assets/SFU_business_logo.jpg';
import balanceCoLabLogo from '@/assets/BalanceCoLab_logo.png';
import sshrcLogo from '@/assets/sshrc-logo.png';
import gustavsonLogo from '@/assets/gustavson-logo.jpg';

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                        <a
                            href="https://www.sfu.ca/beedie.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-opacity hover:opacity-80"
                        >
                            <img
                                src={sfuBusinessLogo}
                                alt="SFU Beedie School of Business"
                                className="h-12 md:h-16 w-auto object-contain dark:bg-white dark:rounded-md dark:p-1"
                            />
                        </a>
                        <a
                            href="https://balancecolab.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-opacity hover:opacity-80"
                        >
                            <img
                                src={balanceCoLabLogo}
                                alt="Balance Co-Lab"
                                className="h-12 md:h-16 w-auto object-contain dark:bg-white dark:rounded-md dark:p-1"
                            />
                        </a>
                        <a
                            href="https://www.sshrc-crsh.gc.ca"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-opacity hover:opacity-80"
                        >
                            <img
                                src={sshrcLogo}
                                alt="SSHRC"
                                className="h-12 md:h-16 w-auto object-contain dark:bg-white dark:rounded-md dark:p-1"
                            />
                        </a>
                        <a
                            href="https://www.uvic.ca/gustavson/index.php"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-opacity hover:opacity-80"
                        >
                            <img
                                src={gustavsonLogo}
                                alt="Gustavson School of Business"
                                className="h-12 md:h-16 w-auto object-contain dark:bg-white dark:rounded-md dark:p-1"
                            />
                        </a>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        © {new Date().getFullYear()} Indigenous Management Research Database. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
