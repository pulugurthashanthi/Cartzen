"use client";
import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "fb-install-dismissed";
const DISMISS_DAYS = 14;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's non-standard flag
    (navigator as { standalone?: boolean }).standalone === true
  );
}

function isDismissed() {
  try {
    const ts = Number(localStorage.getItem(DISMISS_KEY));
    return ts > 0 && Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      if (isDismissed()) return;
      setInstallEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS never fires beforeinstallprompt — show manual instructions instead.
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isIOS) {
      // Wait a bit so the banner doesn't compete with first impressions.
      timer = setTimeout(() => {
        setShowIOS(true);
        setVisible(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // storage unavailable — banner just reappears next visit
    }
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setVisible(false);
    if (outcome === "dismissed") {
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {}
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-slide-up">
      <div className="rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="flex items-start gap-3">
          <img src="/icon-192.png" alt="" className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Add Fake Basket to your home screen</p>
            {showIOS ? (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Tap <Share className="inline w-3.5 h-3.5 align-text-bottom" aria-label="Share" />{" "}
                in Safari, then{" "}
                <span className="whitespace-nowrap">
                  <SquarePlus className="inline w-3.5 h-3.5 align-text-bottom" aria-hidden />{" "}
                  Add to Home Screen
                </span>
                .
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Faster access, full-screen, works offline.
              </p>
            )}
            {!showIOS && (
              <button
                onClick={install}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-fuchsia-500 hover:opacity-90 transition-opacity"
              >
                <Download className="w-3.5 h-3.5" />
                Install app
              </button>
            )}
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss install prompt"
            className="p-1 -m-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
