import {useState} from 'react';
import {Navigate, Route, Routes, useNavigate} from 'react-router-dom';
import {CookieConsent} from './components/layout/CookieConsent/CookieConsent';
import {Footer} from './components/layout/Footer/Footer';
import {HomeView} from './components/pages/home/HomeView';
import {PlanPage} from './components/pages/plan/PlanPage';
import {isPromoDismissed, TabularisPromoModal} from './components/ui/TabularisPromoModal/TabularisPromoModal';
import type {EngineChoice} from './lib/engines/engines';
import {storeLocalPlan} from './lib/share/share';

export default function App() {
    const navigate = useNavigate();
    const [showPromo, setShowPromo] = useState(false);

    const handlePlan = (raw: string, engine: EngineChoice) => {
        storeLocalPlan(raw, engine);
        navigate('/plan');
        if (!isPromoDismissed()) setShowPromo(true);
    };

    return (
        <>
            <main className="container">
                <Routes>
                    <Route path="/" element={<HomeView onPlan={handlePlan} />} />
                    <Route path="/plan" element={<PlanPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {showPromo && <TabularisPromoModal onClose={() => setShowPromo(false)} />}
                <CookieConsent />
            </main>
            <Footer />
        </>
    );
}
