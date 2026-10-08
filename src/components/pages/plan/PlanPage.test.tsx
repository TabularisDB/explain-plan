import {cleanup, render, screen} from '@testing-library/react';
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

    it('shows the local plan and copies a short link that opens it', async () => {
        const user = userEvent.setup();
        storeLocalPlan(SAMPLES[0].text, 'auto');
        renderAt('/plan');

        expect(await screen.findByRole('tab', {name: 'Graph'})).toBeInTheDocument();
        await user.click(screen.getByRole('button', {name: /share/i}));
        expect(await screen.findByText('Copied')).toBeInTheDocument();

        const link = await navigator.clipboard.readText();
        expect(link).toMatch(/\/plan#s=plan000001,[\w-]{22}$/);

        cleanup();
        sessionStorage.clear();
        renderAt(`/plan${link.slice(link.indexOf('#'))}`);
        expect(await screen.findByRole('tab', {name: 'Graph'})).toBeInTheDocument();
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
