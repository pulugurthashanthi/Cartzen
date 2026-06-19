import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="font-display text-2xl font-bold mb-2">You&apos;re offline</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
          No internet — but honestly, the safest possible state for your wallet. 😌
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mb-6">
          Your cart and savings are stored on this device and will be right here when you reconnect.
        </p>
        <Link href="/" className="btn-primary">Try Home Again</Link>
      </div>
    </div>
  );
}
