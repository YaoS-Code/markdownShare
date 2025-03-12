import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const execPromise = promisify(exec);

// Maximum execution time in milliseconds (increased from 5000 to 30000 - 30 seconds)
const EXECUTION_TIMEOUT = 30000;

// Maximum code length
const MAX_CODE_LENGTH = 10000;

// Function to modify code to make it safer to run
function makeSafeForExecution(code: string): string {
  // Check for infinite loops and animations
  const hasInfiniteLoop = code.includes('while True') || 
                         (code.includes('while') && code.includes('sleep'));
  const hasAnimation = code.includes('time.sleep') || 
                       code.includes('animation') || 
                       code.includes('clear_screen') ||
                       code.includes('animate');
  
  if (!hasInfiniteLoop && !hasAnimation) {
    return code; // No modifications needed
  }
  
  let modifiedCode = code;
  
  // Add import for signal if not present
  if (!modifiedCode.includes('import signal')) {
    if (modifiedCode.includes('import ')) {
      // Add after the last import
      const importLines = modifiedCode.split('\n').filter(line => line.trim().startsWith('import ') || line.trim().startsWith('from '));
      const lastImportLine = importLines[importLines.length - 1];
      const lastImportIndex = modifiedCode.indexOf(lastImportLine) + lastImportLine.length;
      modifiedCode = modifiedCode.slice(0, lastImportIndex) + '\nimport signal' + modifiedCode.slice(lastImportIndex);
    } else {
      // Add at the beginning
      modifiedCode = 'import signal\n' + modifiedCode;
    }
  }
  
  // Replace infinite loops with limited loops
  if (hasInfiniteLoop) {
    modifiedCode = modifiedCode.replace(/while\s+True/g, 'for _limited_iteration in range(10)');
  }
  
  // Reduce sleep times
  if (hasAnimation) {
    modifiedCode = modifiedCode.replace(/time\.sleep\s*\(\s*([0-9.]+)\s*\)/g, 'time.sleep(0.01)');
  }
  
  // Add timeout handler at the beginning
  const timeoutHandler = `
# Added by sandbox for safety
def _timeout_handler(signum, frame):
    print("\\n\\n[SANDBOX] Execution time limit reached. Script terminated.")
    exit(0)

signal.signal(signal.SIGALRM, _timeout_handler)
signal.alarm(25)  # Set alarm for 25 seconds
`;
  
  // Find the right place to insert the timeout handler
  const importEndIndex = modifiedCode.indexOf('\n\n', modifiedCode.lastIndexOf('import '));
  if (importEndIndex !== -1) {
    modifiedCode = modifiedCode.slice(0, importEndIndex + 2) + timeoutHandler + modifiedCode.slice(importEndIndex + 2);
  } else {
    modifiedCode = timeoutHandler + modifiedCode;
  }
  
  // Add a note at the beginning of the code
  modifiedCode = `# NOTE: This code has been modified by the sandbox to run safely
# Original animation or infinite loops may not work as expected
# The execution will be limited to prevent timeouts

${modifiedCode}`;
  
  return modifiedCode;
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    // Validate input
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      );
    }

    // Check code length
    if (code.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        { error: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Modify code to make it safer to run
    const safeCode = makeSafeForExecution(code);

    // Create a temporary file with a random name
    const tempFileName = `python_${randomUUID()}.py`;
    const tempFilePath = join('/tmp', tempFileName);

    try {
      // Write the code to the temporary file
      await writeFile(tempFilePath, safeCode);

      // Execute the Python code with a timeout
      const { stdout, stderr } = await Promise.race([
        execPromise(`python3 ${tempFilePath}`),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Execution timed out'));
          }, EXECUTION_TIMEOUT);
        }),
      ]);

      // Check if the code was modified
      const wasModified = safeCode !== code;
      
      // Return the output
      return NextResponse.json({
        output: stderr ? `Error: ${stderr}` : stdout,
        wasModified: wasModified,
        message: wasModified ? 
          "Note: Your code was modified to run safely in the sandbox. Animation or infinite loops may not work as expected." : 
          undefined
      });
    } catch (error) {
      console.error('Execution error:', error);
      return NextResponse.json(
        { 
          error: error instanceof Error 
            ? error.message 
            : 'An error occurred during execution'
        },
        { status: 500 }
      );
    } finally {
      // Clean up the temporary file
      try {
        await unlink(tempFilePath);
      } catch (unlinkError) {
        console.error('Failed to delete temporary file:', unlinkError);
      }
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 