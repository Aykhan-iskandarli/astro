const reset = {
    '@global': {
        '*, *::before, *::after': {
            boxSizing: 'border-box',
        },
        'html, body, h1, h2, h3, h4, p, ul, ol, figure': {
            margin: 0,
            padding: 0,
        },
        'ul, ol': {
            listStyle: 'none',
        },
        'img, svg, canvas': {
            display: 'block',
            maxWidth: '100%',
        },
        'button, input, select, textarea': {
            font: 'inherit',
        },
    },
};

export default reset;
