const express = require('express');
const port = process.env.NERU_APP_PORT || 3000;
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    server.use(express.urlencoded({ extended: false }));
    server.use(express.json());

    server.all('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    })
});