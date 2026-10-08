import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import visualExplain from './locales/visual-explain.en.json';

i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
        en: {
            translation: {
                editor: {visualExplain},
            },
        },
    },
    interpolation: {escapeValue: false},
});

export default i18n;
