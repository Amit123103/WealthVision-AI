export const defaultLocale = 'en';

export const locales = ['en', 'es', 'fr', 'pt'];

// Stub translation dictionary architecture
export const dictionaries: Record<string, any> = {
  en: {
    heroTitleLine1: "AI-Powered Wealth Estimation for",
    heroTitleLine2: "Smarter Policy Decisions",
    heroSubtitle: "Deploy high-resolution satellite imagery directly into our deep learning pipeline to generate hyper-local socio-economic indices and design equitable welfare subsidies instantly.",
    btnGetStarted: "Get Started",
    btnViewFeatures: "View Features",
    featuresTitle: "Unprecedented Geospatial Insights",
    featuresSubtitle: "Leverage visual transformers and PostGIS bounding calculations.",
    useCasesTitle: "Built For the Public Sector",
    footer: "© 2026 GeoWealth Pro Platform. All rights reserved."
  },
  es: {
    heroTitleLine1: "Estimación de Riqueza con IA para",
    heroTitleLine2: "Decisiones Políticas Inteligentes",
    heroSubtitle: "Despliega imágenes satelitales directamente en nuestro modelo de aprendizaje profundo para generar índices socioeconómicos hiperlocales al instante.",
    btnGetStarted: "Empezar",
    btnViewFeatures: "Ver Funciones",
    featuresTitle: "Perspectivas Geoespaciales Sin Precedentes",
    featuresSubtitle: "Aprovecha los transformadores visuales y cálculos PostGIS.",
    useCasesTitle: "Construido para el Sector Público",
    footer: "© 2026 Plataforma GeoWealth Pro. Todos los derechos reservados."
  },
  fr: {
    heroTitleLine1: "Estimation de la richesse par l'IA pour",
    heroTitleLine2: "Des décisions politiques plus intelligentes",
    heroSubtitle: "Déployez l'imagerie satellite en haute résolution directement dans notre pipeline d'apprentissage en profondeur pour concevoir des subventions équitables instantanément.",
    btnGetStarted: "Commencer",
    btnViewFeatures: "Voir les fonctionnalités",
    featuresTitle: "Des aperçus géospatiaux sans précédent",
    featuresSubtitle: "Tirez parti des transformateurs visuels et des calculs PostGIS.",
    useCasesTitle: "Conçu pour le Secteur Public",
    footer: "© 2026 Plate-forme GeoWealth Pro. Tous droits réservés."
  },
  pt: {
    heroTitleLine1: "Estimativa de Riqueza baseada em IA para",
    heroTitleLine2: "Decisões Políticas Inteligentes",
    heroSubtitle: "Implante imagens de satélite de alta resolução diretamente em nosso pipeline de aprendizado profundo para gerar índices socioeconômicos.",
    btnGetStarted: "Começar",
    btnViewFeatures: "Ver Recursos",
    featuresTitle: "Insights Geoespaciais Sem Precedentes",
    featuresSubtitle: "Aproveite transformadores visuais e cálculos PostGIS.",
    useCasesTitle: "Construído Para o Setor Público",
    footer: "© 2026 Plataforma GeoWealth Pro. Todos os direitos reservados."
  }
};

export const getTranslation = (locale: string = defaultLocale) => {
  return dictionaries[locale] || dictionaries[defaultLocale];
};
