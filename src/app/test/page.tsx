"use client";

import { useEffect } from 'react';

export default function TestPage() {
    useEffect(() => {
        console.log("Test page loaded");
        // Check if Tailwind classes are in the document
        const styles = window.getComputedStyle(document.documentElement);
        console.log("Background color of red-500:", styles.getPropertyValue('--tw-bg-opacity'));
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <h1 className="text-4xl font-bold text-blue-500">
                Tailwind Test Page
            </h1>
            
            {/* Test different Tailwind features */}
            <div className="space-y-4">
                <div className="bg-red-500 p-4 text-white">
                    This should be red with white text
                </div>
                
                <div className="bg-blue-500 p-4 text-white hover:bg-blue-700 transition-colors">
                    This should be blue and darken on hover
                </div>
                
                <div className="border-2 border-green-500 p-4 rounded-lg shadow-lg">
                    This should have a green border and shadow
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-purple-500 p-4 text-white">Grid 1</div>
                    <div className="bg-purple-600 p-4 text-white">Grid 2</div>
                    <div className="bg-purple-700 p-4 text-white">Grid 3</div>
                </div>
                
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Hover Me
                </button>
            </div>
            
            <div className="mt-8 text-gray-600">
                Check the console for Tailwind detection logs
            </div>
        </div>
    );
} 