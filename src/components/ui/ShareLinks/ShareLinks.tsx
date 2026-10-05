import type {ComponentType} from 'react';
import {BlueskyIcon, LinkedInIcon, RedditIcon, XBrandIcon} from '../Icons';
import {buildSocialShareUrls} from '../../../lib/social';

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
    {label: 'Share on Bluesky', href: SHARE_URLS.bluesky, Icon: BlueskyIcon},
    {label: 'Share on X', href: SHARE_URLS.x, Icon: XBrandIcon},
    {label: 'Share on LinkedIn', href: SHARE_URLS.linkedin, Icon: LinkedInIcon},
    {label: 'Share on Reddit', href: SHARE_URLS.reddit, Icon: RedditIcon},
];

interface ShareLinksProps {
    linkClassName?: string;
    iconSize?: number;
}

export function ShareLinks({linkClassName, iconSize = 18}: ShareLinksProps) {
    return (
        <>
            {SHARE_TARGETS.map(({label, href, Icon}) => (
                <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className={linkClassName}
                >
                    <Icon size={iconSize} />
                </a>
            ))}
        </>
    );
}
