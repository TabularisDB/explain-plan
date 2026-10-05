import type {ExplainPlan} from '@tabularis/explain';
import {useState} from 'react';
import {Navigate, Route, Routes, useNavigate} from 'react-router-dom';
import {HomeView} from './components/pages/home/HomeView';
import {PlanView} from './components/pages/plan/PlanView';
import {isPromoDismissed, TabularisPromoModal} from './components/ui/TabularisPromoModal/TabularisPromoModal';
import {CookieConsent} from './components/layout/CookieConsent/CookieConsent';
import {Footer} from './components/layout/Footer/Footer';

export default function App() {
    const navigate = useNavigate();
    const [plan, setPlan] = useState<ExplainPlan | null>(null);
    const [showPromo, setShowPromo] = useState(false);

    const handlePlan = (parsed: ExplainPlan) => {
        setPlan(parsed);
        navigate('/plan');
        if (!isPromoDismissed()) setShowPromo(true);
    };

    return (
        <>
            <main className="container">
                <Routes>
                    <Route path="/" element={<HomeView onPlan={handlePlan} />} />
                    <Route path="/plan" element={plan ? <PlanView plan={plan} /> : <Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {showPromo && <TabularisPromoModal onClose={() => setShowPromo(false)} />}
                <CookieConsent />
            </main>
            <Footer />
        </>
    );
}
