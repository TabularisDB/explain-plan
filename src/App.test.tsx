import {cleanup, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach, describe, expect, it} from 'vitest';
import App from './App';
import './i18n';

const renderApp = () =>
    render(
        <MemoryRouter initialEntries={['/']}>
            <App />
        </MemoryRouter>,
    );

const loadSample = async (user: ReturnType<typeof userEvent.setup>, name: string) => {
    await user.click(screen.getByRole('button', {name: 'Load sample'}));
    await user.click(screen.getByRole('button', {name}));
};

const visualize = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', {name: /visualize plan/i}));
};

const closePromo = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(await screen.findByRole('button', {name: /continue in browser/i}));
};

describe('App', () => {
    beforeEach(() => {
        cleanup();
        localStorage.clear();
        sessionStorage.clear();
    });

    it('renders the input form with engine choices and footer links', async () => {
        const user = userEvent.setup();
        renderApp();

        expect(screen.getByRole('heading', {level: 1, name: /understand any explain plan/i})).toBeInTheDocument();

        await user.click(screen.getByRole('button', {name: /auto-detect/i}));
        for (const name of ['PostgreSQL', 'MySQL / MariaDB', 'SQLite', 'SQL Server', 'Oracle']) {
            expect(screen.getByRole('button', {name})).toBeInTheDocument();
        }

        expect(screen.getByRole('link', {name: 'Tabularis'})).toHaveAttribute('href', 'https://tabularis.dev');
        for (const link of screen.getAllByRole('link', {name: 'Visual EXPLAIN'})) {
            expect(link).toHaveAttribute('href', 'https://tabularis.dev/solutions/visual-explain');
        }
    });

    it('visualizes a sample plan and shows the promo modal', async () => {
        const user = userEvent.setup();
        renderApp();

        await loadSample(user, 'SQLite sample');
        await visualize(user);

        const dialog = await screen.findByRole('dialog', {name: /copy-paste/i});
        expect(within(dialog).getByRole('link', {name: /download tabularis/i})).toHaveAttribute(
            'href',
            'https://tabularis.dev/download',
        );
        await closePromo(user);

        expect(await screen.findByRole('tab', {name: 'Graph'})).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('tab', {name: 'Raw Output'})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /share/i})).toBeInTheDocument();
    });

    it('renders every plan view for a SQL Server runtime sample', async () => {
        const user = userEvent.setup();
        const {container} = renderApp();

        await loadSample(user, 'SQL Server sample');
        expect(screen.getByRole('button', {name: 'SQL Server'})).toBeInTheDocument();
        await visualize(user);
        await closePromo(user);

        await screen.findByRole('tab', {name: 'Graph'});
        expect(container.querySelector('.react-flow')).toBeInTheDocument();

        await user.click(screen.getByRole('tab', {name: 'Diagram'}));
        expect(screen.getByRole('radiogroup', {name: 'Metric'})).toBeInTheDocument();
        expect(screen.getAllByText('Nested Loops')).not.toHaveLength(0);

        await user.click(screen.getByRole('tab', {name: 'Table'}));
        expect(screen.getByRole('table')).toBeInTheDocument();

        await user.click(screen.getByRole('tab', {name: 'Stats'}));
        expect(screen.getByText('Time by Operation')).toBeInTheDocument();

        await user.click(screen.getByRole('tab', {name: 'Raw Output'}));
        expect(screen.getByRole('heading', {name: /raw output/i})).toBeInTheDocument();
        expect(container.querySelector('pre')).toHaveTextContent('ShowPlanXML');

        await user.click(screen.getByRole('tab', {name: 'AI Analysis'}));
        expect(screen.getByRole('heading', {name: /AI plan analysis is a Tabularis feature/i})).toBeInTheDocument();
    });

    it('shows a readable error for unparseable input', async () => {
        const user = userEvent.setup();
        renderApp();

        await user.type(screen.getByRole('textbox'), 'garbage');
        await visualize(user);

        expect(screen.getByRole('alert')).toHaveTextContent(/could not detect/i);
    });

    it('does not show the promo again once opted out', async () => {
        const user = userEvent.setup();
        renderApp();

        await loadSample(user, 'SQLite sample');
        await visualize(user);
        await user.click(await screen.findByRole('checkbox', {name: /don't show/i}));
        await closePromo(user);

        await user.click(await screen.findByRole('link', {name: /new plan/i}));
        await loadSample(user, 'SQLite sample');
        await visualize(user);

        await screen.findByRole('tab', {name: 'Graph'});
        expect(screen.queryByRole('dialog', {name: /copy-paste/i})).not.toBeInTheDocument();
    });

    it('keeps the promo open when the demo video is closed with Escape', async () => {
        const user = userEvent.setup();
        renderApp();

        await loadSample(user, 'SQLite sample');
        await visualize(user);
        const dialog = await screen.findByRole('dialog', {name: /copy-paste/i});

        await user.tab();
        expect(within(dialog).getByRole('button', {name: 'Close'})).toHaveFocus();

        const preview = within(dialog).getByRole('button', {name: /watch the tabularis/i});
        preview.focus();
        await user.keyboard('{Enter}');
        expect(screen.getByRole('dialog', {name: /watch the tabularis/i})).toBeInTheDocument();
        await user.keyboard('{Escape}');

        expect(screen.queryByRole('dialog', {name: /watch the tabularis/i})).not.toBeInTheDocument();
        expect(screen.getByRole('dialog', {name: /copy-paste/i})).toBeInTheDocument();
    });

    it('visualizes the Oracle sample and explains how to capture a plan', async () => {
        const user = userEvent.setup();
        const {container} = renderApp();

        await loadSample(user, 'Oracle sample');
        expect(screen.getByRole('tab', {name: 'Oracle'})).toHaveAttribute('aria-selected', 'true');
        expect(screen.getAllByText(/SET LONG 1000000/)).not.toHaveLength(0);
        await visualize(user);
        await closePromo(user);

        await screen.findByRole('tab', {name: 'Graph'});
        expect(container.querySelector('.react-flow')).toBeInTheDocument();
    });
});
