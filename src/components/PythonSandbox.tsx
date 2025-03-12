"use client";

import { useState } from 'react';

interface PythonSandboxProps {
    code: string;
}

export default function PythonSandbox({ code }: PythonSandboxProps) {
    const [output, setOutput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCodeExpanded, setIsCodeExpanded] = useState<boolean>(false);
    const [wasCodeModified, setWasCodeModified] = useState<boolean>(false);
    const [modificationMessage, setModificationMessage] = useState<string | null>(null);

    // Get the first line of code for preview
    const firstLine = code.split('\n')[0];
    const codePreview = firstLine + (code.includes('\n') ? '...' : '');

    // Count the number of lines in the code
    const lineCount = code.split('\n').length;

    // Check if code contains potentially problematic patterns
    const hasInfiniteLoop = code.includes('while True') ||
        (code.includes('while') && code.includes('sleep'));
    const hasAnimation = code.includes('time.sleep') ||
        code.includes('animation') ||
        code.includes('clear_screen') ||
        code.includes('animate');

    const runCode = async () => {
        setIsLoading(true);
        setError(null);
        setOutput('');
        setWasCodeModified(false);
        setModificationMessage(null);

        try {
            const response = await fetch('/api/execute-python', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to execute code');
            }

            setOutput(data.output);

            // Check if code was modified
            if (data.wasModified) {
                setWasCodeModified(true);
                setModificationMessage(data.message || "Code was modified to run safely in the sandbox.");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';

            // Provide more helpful error messages for timeouts
            if (errorMessage.includes('timed out')) {
                if (hasInfiniteLoop) {
                    setError('Execution timed out: This code contains an infinite loop which cannot run in the sandbox environment.');
                } else if (hasAnimation) {
                    setError('Execution timed out: This code appears to contain animation or sleep functions which may not work well in the sandbox environment.');
                } else {
                    setError('Execution timed out: The code took too long to run. Try simplifying it or removing long-running operations.');
                }
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="my-4 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Python ({lineCount} lines)
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsCodeExpanded(!isCodeExpanded)}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                        {isCodeExpanded ? 'Collapse' : 'Expand'}
                    </button>
                    <button
                        onClick={runCode}
                        disabled={isLoading}
                        className={`px-2 py-1 text-xs rounded text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                    >
                        {isLoading ? 'Running...' : 'Run'}
                    </button>
                </div>
            </div>

            {/* Warning message */}
            {(hasInfiniteLoop || hasAnimation) && (
                <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-800/30 text-xs text-yellow-800 dark:text-yellow-300">
                    <strong>Warning:</strong> This code contains {hasInfiniteLoop ? 'an infinite loop' : 'animation functions'} which may not run correctly in this sandbox.
                </div>
            )}

            {/* Code area */}
            {isCodeExpanded ? (
                <pre className="p-3 bg-gray-50 dark:bg-gray-900 overflow-x-auto max-h-96 text-sm">
                    <code className="text-gray-800 dark:text-gray-200 font-mono">{code}</code>
                </pre>
            ) : (
                <div
                    onClick={() => setIsCodeExpanded(true)}
                    className="p-3 bg-gray-50 dark:bg-gray-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex justify-between items-center"
                >
                    <code className="text-sm text-gray-600 dark:text-gray-400 font-mono truncate">{codePreview}</code>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">Click to expand</span>
                </div>
            )}

            {/* Output area */}
            {(output || error || wasCodeModified) && (
                <>
                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Output
                    </div>

                    {wasCodeModified && (
                        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/30 text-xs text-blue-800 dark:text-blue-300">
                            <strong>Note:</strong> {modificationMessage}
                        </div>
                    )}

                    <pre className={`p-3 overflow-x-auto max-h-60 text-sm font-mono ${error ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400' : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                        }`}>
                        {error || output || 'No output'}
                    </pre>
                </>
            )}
        </div>
    );
} 