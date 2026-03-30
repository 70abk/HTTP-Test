const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const http = require('http');
const cookieParser = require('cookie-parser');

// sequence 클래스
class Sequence {
    constructor(func, init = 1) {
        this.seq = [init];
        this.index = 1;
        this.func = func;
    }

    call(index) {
        if (!Number.isInteger(index)) {
            throw new TypeError('Index must be an integer');
        }

        while (this.index <= index) {
            this.seq.push(this.func(this.seq[this.seq.length - 1]));
            this.index++;
        }

        return this.seq[index - 1];
    }
}

function normalizeByte(value) {
    return Math.abs(Math.floor(value)) % 256;
}

function next(current, func) {
    return normalizeByte(func(current));
}

function seedValue(privateKey, n) {
    const seq = new Sequence(privateKey.func, privateKey.init);
    return normalizeByte(seq.call(n));
}

// 키 생성
function keygenSingle(func, init, n = 20) {
    const publicKey = {
        n,
        func
    };

    const privateKey = {
        init,
        func
    };

    return { publicKey, privateKey };
}

// 수열 정의
const { publicKey: pub1, privateKey: priv1 } = keygenSingle(
    x => 2 * x * Math.sin(x) + x * Math.cos(x * x),
    15
);

const { publicKey: pub2, privateKey: priv2 } = keygenSingle(
    x => x + Math.log(2 + (x ** 3) * Math.exp(-x)),
    1
);

const { publicKey: pub3, privateKey: priv3 } = keygenSingle(
    x => 2 * x + 3,
    1
);

// 암호화
// 연구 목적상 seed를 암호화에도 사용해서, seed 없이는 동일 키스트림을 만들 수 없게 구성
function encrypt(message, publicKey, privateKey) {
    const start = Math.floor(Math.random() * 256);
    const seedOffset = seedValue(privateKey, publicKey.n);
    let current = (start + seedOffset) % 256;
    const result = [];

    for (let i = 0; i < message.length; i++) {
        const k = current;
        result.push((message.charCodeAt(i) + k) % 256);
        current = next(current, publicKey.func);
    }

    return {
        start,
        cipher: Buffer.from(result)
    };
}

// 복호화
function decrypt(encrypted, privateKey, n) {
    const seedOffset = seedValue(privateKey, n);
    const cipherBuffer = encrypted.cipher;
    let current = (encrypted.start + seedOffset) % 256;
    let result = '';

    for (let i = 0; i < cipherBuffer.length; i++) {
        const k = current;
        result += String.fromCharCode((cipherBuffer[i] - k + 256) % 256);
        current = next(current, privateKey.func);
    }

    return result;
}

// 테스트
const msg = 'Hello';

const enc1 = encrypt(msg, pub1, priv1);
const dec1 = decrypt(enc1, priv1, pub1.n);

const enc2 = encrypt(msg, pub2, priv2);
const dec2 = decrypt(enc2, priv2, pub2.n);

const enc3 = encrypt(msg, pub3, priv3);
const dec3 = decrypt(enc3, priv3, pub3.n);

const wrongDec1 = decrypt(enc1, { init: 999, func: priv1.func }, pub1.n);

console.log('enc1:', enc1.cipher.toString('hex'), '| start1:', enc1.start, '| dec1:', dec1, '| wrong1:', wrongDec1);
console.log('enc2:', enc2.cipher.toString('hex'), '| start2:', enc2.start, '| dec2:', dec2);
console.log('enc3:', enc3.cipher.toString('hex'), '| start3:', enc3.start, '| dec3:', dec3);

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


