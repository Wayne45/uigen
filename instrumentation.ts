export async function register() {
  console.log('[instrumentation] Registering...');

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[instrumentation] Running in Node.js runtime');

    // Set up localStorage debugging
    await import('./src/lib/debug-localStorage');
  }
}
