export const headerConfig = {
    text: 'Oh My Stars'
};

export const footerConfig = {
    brand: {
        text: 'Oh My Stars',
        description: 'An interactive journey through the cosmos. Explore stellar phenomena and the mysteries of deep space.'
    },
    navigation: {
        links: [
            { text: 'Star Map', href: '#map' },
            { text: 'Points of Interest', href: '#poi' },
            { text: 'Documentation', href: '#docs' },
            { text: 'Updates', href: '#updates' },
            { text: 'About', href: '#about' }
        ]
    },
    copyright: '© 2025 S&A All rights reserved.'
};

// Helper function to wrap text in glow spans
export function wrapTextInGlowSpans(text) {
    return [...text].map(char => 
        char === ' ' ? '<span class="glow-char">&nbsp;</span>' : 
        `<span class="glow-char">${char}</span>`
    ).join('');
}

export function createHeaderElement() {
    const headerDiv = document.createElement('div');
    headerDiv.className = 'css3d-element css3d-header';
    headerDiv.style.width = '250px';
    headerDiv.style.fontSize = '7px';  // Changed from '0.25em' to '7px'
    headerDiv.style.background = 'none';
    headerDiv.style.color = '#afafaf';
    headerDiv.innerHTML = `<h1>${wrapTextInGlowSpans(headerConfig.text)}</h1>`;
    return headerDiv;
}

export function createFooterElement() {
    const footerDiv = document.createElement('div');
    footerDiv.className = 'css3d-element css3d-footer';
    footerDiv.style.width = 'auto';
    footerDiv.style.fontSize = '1.5px';
    footerDiv.style.background = 'rgba(0,0,0,0.5)';
    footerDiv.style.padding = '6px 15px';
    footerDiv.style.boxSizing = 'border-box';
    footerDiv.style.height = '42px';
    
    // Split navigation links into two arrays
    const halfLength = Math.ceil(footerConfig.navigation.links.length / 2);
    const leftLinks = footerConfig.navigation.links.slice(0, halfLength);
    const rightLinks = footerConfig.navigation.links.slice(halfLength);
    
    footerDiv.innerHTML = `
        <div class="footer-content" style="margin-bottom: 2px">
            <div class="footer-brand">
                <h2 style="font-size: 6px; margin: 0 0 3px 0; color: #afafaf; font-weight: normal">${wrapTextInGlowSpans(footerConfig.brand.text)}</h2>
                <p style="font-size: 4px; line-height: 1.2; color: #aaa; margin: 0">${wrapTextInGlowSpans(footerConfig.brand.description)}</p>
            </div>
            <div style="display: flex; gap: 12px">
                <nav class="footer-nav" style="width: 45px; gap: 2px; display: flex; flex-direction: column; align-items: center">
                    ${leftLinks.map(link => 
                        `<a href="${link.href}" class="footer-link" style="font-size: 3.8px; display: inline-block">${wrapTextInGlowSpans(link.text)}</a>`
                    ).join('')}
                </nav>
                <nav class="footer-nav" style="width: 45px; gap: 2px; display: flex; flex-direction: column; align-items: center">
                    ${rightLinks.map(link => 
                        `<a href="${link.href}" class="footer-link" style="font-size: 3.8px; display: inline-block">${wrapTextInGlowSpans(link.text)}</a>`
                    ).join('')}
                </nav>
            </div>
        </div>
        <div class="copyright" style="font-size: 2.75px; color: #aaa; text-align: center; margin-top: 2px; padding-top: 2px; border-top: 0.5px solid rgba(255,255,255,0.1)">${wrapTextInGlowSpans(footerConfig.copyright)}</div>
    `;
    
    // Add mouse move handler after creating the footer
    setTimeout(() => {
        const links = footerDiv.querySelectorAll('a.footer-link');
        links.forEach(link => {
            link.addEventListener('mousemove', (e) => {
                const rect = link.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                link.style.setProperty('--mouse-x', `${x}%`);
                link.style.setProperty('--mouse-y', `${y}%`);
            });
        });
    }, 0);

    return footerDiv;
}
