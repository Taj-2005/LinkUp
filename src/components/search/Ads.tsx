"use client";

export default function Ads() {
    return (
        <div className="w-full p-6">
            <div className="bg-left-nav-light dark:bg-left-nav-dark rounded-lg p-6 border border-primary-light dark:border-primary-dark">
                <div className="flex flex-col items-center justify-center space-y-4">
                    {/* Placeholder Icon */}
                    <div className="w-20 h-20 bg-primary-light dark:bg-primary-dark rounded-full flex items-center justify-center">
                        <svg 
                            className="w-10 h-10 text-gray-400 dark:text-gray-500" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" 
                            />
                        </svg>
                    </div>
                    
                    {/* Ad Text */}
                    <div className="text-center">
                        <h3 className="text-black dark:text-white font-bold text-lg mb-2">
                            Sponsored Content
                        </h3>
                        <p className="text-primary-light dark:text-primary-light text-sm">
                            Your ad could be here
                        </p>
                    </div>
                    
                    {/* CTA Button */}
                    <button className="bg-primary-light dark:bg-primary-dark hover:opacity-90 text-white font-semibold px-6 py-2 rounded-lg transition-all">
                        Learn More
                    </button>
                    
                    {/* Sponsored Label */}
                    <div className="text-xs text-primary-light dark:text-primary-light mt-2">
                        Sponsored
                    </div>
                </div>
            </div>
        </div>
    );
}