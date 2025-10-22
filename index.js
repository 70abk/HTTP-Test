const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const http = require('http');
const https = require('https');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'Client')));
app.use(cookieParser());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const hakbun = req.body.hakbun;
        const ext = path.extname(file.originalname);
        cb(null, `${hakbun}_${Date.now()}${ext}`);
    }
});

const upload = multer({ storage: storage });
app.get('/set-cookie', (req, res) => {
    res.cookie('session_id', 'user12345', {
        httpOnly: true,        // JS에서 접근 불가
        secure: true,          // HTTPS에서만 전송
        sameSite: 'Strict',    // 외부 요청에서 쿠키 전송 금지
        maxAge: 1000 * 60 * 10 // 10분 유지
    });
    res.send('보안 쿠키가 설정되었습니다.');
});

// index.html 전송
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client', 'index.html'));
});

// 파일 업로드 처리
app.post('/upload', upload.single('hwfile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }

    res.json({
        message: '파일이 성공적으로 업로드되었습니다.',
        filename: req.file.filename
    });
});

http.createServer(app).listen(3000, () => {
    console.log('HTTP  서버:  http://localhost:3000');
});

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.crt'))
};

https.createServer(httpsOptions, app).listen(3443, () => {
    console.log('HTTPS 서버: https://localhost:3443');
});
