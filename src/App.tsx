import {Suspense, useMemo, useState} from 'react';
import {Navigate, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {CookieConsent} from './components/layout/CookieConsent/CookieConsent';
import {Footer} from './components/layout/Footer/Footer';
import {HomeView} from './components/pages/home/HomeView';
import {PlanView} from './components/pages/plan/PlanView';
import {isPromoDismissed, TabularisPromoModal} from './components/ui/TabularisPromoModal/TabularisPromoModal';
import type {EngineChoice} from './lib/parse';
import {encodePlan, planFromHash} from './lib/share';

function PlanRoute() {
    const {hash} = useLocation();
    const plan = useMemo(() => planFromHash(hash), [hash]);
    if (!plan) return <Navigate to="/" replace />;
    return <PlanView plan={plan} />;
}

export default function App() {
    const navigate = useNavigate();
    const [showPromo, setShowPromo] = useState(false);

    const handlePlan = (raw: string, engine: EngineChoice) => {
        navigate(`/plan#p=${encodePlan(raw, engine)}`);
        if (!isPromoDismissed()) setShowPromo(true);
    };

    return (
        <>
            <main className="container">
                <Routes>
                    <Route path="/" element={<HomeView onPlan={handlePlan} />} />
                    <Route
                        path="/plan"
                        element={
                            <Suspense fallback={null}>
                                <PlanRoute />
                            </Suspense>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {showPromo && <TabularisPromoModal onClose={() => setShowPromo(false)} />}
                <CookieConsent />
            </main>
            <Footer />
        </>
    );
}
