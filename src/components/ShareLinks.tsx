import type { ComponentType } from "react";
import {
  BlueskyIcon,
  LinkedInIcon,
  RedditIcon,
  XBrandIcon,
} from "./Icons";
import { buildSocialShareUrls } from "../lib/social";

interface IconProps {
  size?: number;
  className?: string;
}

const SHARE_URLS = buildSocialShareUrls();

const SHARE_TARGETS: Array<{
  label: string;
  href: string;
  Icon: ComponentType<IconProps>;
}> = [
  { label: "Share on Bluesky", href: SHARE_URLS.bluesky, Icon: BlueskyIcon },
  { label: "Share on X", href: SHARE_URLS.x, Icon: XBrandIcon },
  { label: "Share on LinkedIn", href: SHARE_URLS.linkedin, Icon: LinkedInIcon },
  { label: "Share on Reddit", href: SHARE_URLS.reddit, Icon: RedditIcon },
];

interface ShareLinksProps {
  /** Icon size in px. */
  iconSize?: number;
}

/** Icon buttons that share this tool on the same socials as tabularis.dev. */
export function ShareLinks({ iconSize = 14 }: ShareLinksProps) {
  return (
    <>
      {SHARE_TARGETS.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-default bg-surface-primary/40 text-secondary transition-colors hover:border-strong hover:text-primary"
        >
          <Icon size={iconSize} />
        </a>
      ))}
    </>
  );
}
