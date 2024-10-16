const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

// 업로드 경로와 파일이름 설정
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

// 기본 응답
app.get('/', (req, res) => {
    res.send('서버가 정상 작동 중입니다.');
});

// 서버 실행
app.listen(3000, () => {
    console.log('서버가 http://localhost:3000 에서 실행 중입니다.');
});
