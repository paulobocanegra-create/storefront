"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/ui/components/ui/button";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
	const t = useTranslations("theme");
	const { resolvedTheme, setTheme } = useTheme();
	// The server cannot know localStorage or the device preference. Keep the first
	// client render identical to the server, without hiding or shifting the control.
	const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
	const isDark = mounted && resolvedTheme === "dark";
	const label = mounted ? t(isDark ? "switchToLight" : "switchToDark") : t("toggle");

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			className="h-11 w-11 shrink-0"
			aria-label={label}
			title={label}
			disabled={!mounted}
			onClick={() => setTheme(isDark ? "light" : "dark")}
		>
			{isDark ? (
				<Sun className="h-5 w-5" aria-hidden="true" />
			) : (
				<Moon className="h-5 w-5" aria-hidden="true" />
			)}
		</Button>
	);
}
