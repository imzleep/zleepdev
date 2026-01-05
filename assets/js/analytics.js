
(function () {

    if (typeof CONFIG === 'undefined' || !CONFIG.GA_ID || CONFIG.GA_ID === 'G-XXXXXXXXXX') {
        console.warn('GA4: ID not configured. Analytics disabled.');
        return;
    }

    const gaId = CONFIG.GA_ID;


    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);


    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', gaId);

    console.log(`GA4 Loaded: ${gaId}`);
})();
