import {cleanup, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import '../../../i18n';
import {storeLocalPlan} from '../../../lib/share/share';
import {SAMPLES} from '../../../samples';
import {PlanPage} from './PlanPage';

const renderAt = (entry: string) =>
    render(
        <MemoryRouter initialEntries={[entry]}>
            <Routes>
                <Route path="/" element={<p>Home page</p>} />
                <Route path="/plan" element={<PlanPage />} />
            </Routes>
        </MemoryRouter>,
    );

describe('PlanPage', () => {
    const store = new Map<string, BodyInit>();

    beforeEach(() => {
        store.clear();
        sessionStorage.clear();
        vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
            if (init?.method === 'POST') {
                store.set('plan000001', init.body!);
                return new Response(JSON.stringify({id: 'plan000001'}), {status: 201});
            }
            const body = store.get(url.split('/').pop()!);
            return body ? new Response(body) : new Response('Not found', {status: 404});
        });
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    it('explains the short link, then creates and copies it', async () => {
        const user = userEvent.setup();
        storeLocalPlan(SAMPLES[0].text, SAMPLES[0].engine);
        renderAt('/plan');

        expect(await screen.findByRole('tab', {name: 'Graph'})).toBeInTheDocument();
        await user.click(screen.getByRole('button', {name: /share/i}));

        const dialog = screen.getByRole('dialog', {name: 'Share this plan'});
        expect(dialog).toHaveTextContent(/encrypted in your browser/i);
        expect(dialog).toHaveTextContent(/30 days/i);
        expect(store.size).toBe(0);

        await user.click(within(dialog).getByRole('button', {name: /create and copy link/i}));
        expect(await within(dialog).findByText('Copied')).toBeInTheDocument();

        const link = await navigator.clipboard.readText();
        expect(link).toMatch(/\/plan#s=plan000001,[\w-]{22}$/);
        expect(within(dialog).getByRole('textbox', {name: 'Short link'})).toHaveValue(link);

        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog', {name: 'Share this plan'})).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', {name: /share/i}));
        expect(screen.getByRole('textbox', {name: 'Short link'})).toHaveValue(link);
        expect(store.size).toBe(1);

        cleanup();
        sessionStorage.clear();
        renderAt(`/plan${link.slice(link.indexOf('#'))}`);
        expect(await screen.findByRole('tab', {name: 'Graph'})).toBeInTheDocument();
    });

    it('reuses the current short link instead of storing the plan again', async () => {
        const user = userEvent.setup();
        storeLocalPlan(SAMPLES[0].text, SAMPLES[0].engine);
        renderAt('/plan');
        await user.click(await screen.findByRole('button', {name: /share/i}));
        await user.click(screen.getByRole('button', {name: /create and copy link/i}));
        const link = await navigator.clipboard.readText();

        cleanup();
        renderAt(`/plan${link.slice(link.indexOf('#'))}`);
        await user.click(await screen.findByRole('button', {name: /share/i}));
        expect(screen.getByRole('textbox', {name: 'Short link'})).toHaveValue(link);
        expect(store.size).toBe(1);
    });

    it('explains that the link could not be created', async () => {
        const user = userEvent.setup();
        storeLocalPlan(SAMPLES[0].text, SAMPLES[0].engine);
        renderAt('/plan');
        vi.stubGlobal('fetch', async () => new Response('Too many requests', {status: 429}));

        await user.click(await screen.findByRole('button', {name: /share/i}));
        await user.click(screen.getByRole('button', {name: /create and copy link/i}));
        expect(await screen.findByRole('alert')).toHaveTextContent(/could not be created/i);
    });

    it('explains that a short link has expired', async () => {
        renderAt('/plan#s=plan999999,AAAAAAAAAAAAAAAAAAAAAA');
        expect(await screen.findByRole('heading', {name: /expired or does not exist/i})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /share/i})).not.toBeInTheDocument();
    });

    it('explains that a short link is damaged', async () => {
        renderAt('/plan#s=plan000001');
        expect(await screen.findByRole('heading', {name: /incomplete or damaged/i})).toBeInTheDocument();
    });

    it('explains a network error', async () => {
        vi.stubGlobal('fetch', async () => {
            throw new TypeError('Failed to fetch');
        });
        renderAt('/plan#s=plan000001,AAAAAAAAAAAAAAAAAAAAAA');
        expect(await screen.findByRole('heading', {name: /could not be loaded/i})).toBeInTheDocument();
    });

    it('goes back home when there is no plan to show', async () => {
        renderAt('/plan');
        expect(await screen.findByText('Home page')).toBeInTheDocument();
    });
});
