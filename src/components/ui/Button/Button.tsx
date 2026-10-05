/* eslint-disable css-modules/no-unused-class */
import clsx from 'clsx';
import type {ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes} from 'react';
import styles from './Button.module.scss';
import {Link} from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type CommonProps = {
    variant?: Variant;
    size?: Size;
    children: ReactNode;
    className?: string;
    external?: boolean;
};

type AsButton = CommonProps &
    ButtonHTMLAttributes<HTMLButtonElement> & {
        href?: undefined;
    };

type AsLink = CommonProps &
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
        href: string;
    };

type ButtonProps = AsButton | AsLink;

export function Button({variant = 'primary', size = 'md', children, className, external, href, ...rest}: ButtonProps) {
    const classes = clsx(styles.button, styles[variant], styles[size], className);

    if (href) {
        if (external || href.startsWith('http')) {
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classes}
                    {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
                >
                    {children}
                </a>
            );
        }

        return (
            <Link to={href} className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
            {children}
        </button>
    );
}
