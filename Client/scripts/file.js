const PUBLIC_KEY = {
    n: 20,
    funcId: 'lin-v1'
};

const FUNC_MAP = {
    'lin-v1': x => 2 * x + 3
};

function normalizeByte(value) {
    return Math.abs(Math.floor(value)) % 256;
}

function next(current, func) {
    return normalizeByte(func(current));
}

function encryptBytes(inputBytes, publicKey, seed) {
    const func = FUNC_MAP[publicKey.funcId];
    if (!func) {
        throw new Error('지원하지 않는 수열 함수입니다.');
    }

    let seedValue = normalizeByte(seed);
    for (let i = 1; i < publicKey.n; i++) {
        seedValue = next(seedValue, func);
    }

    const start = Math.floor(Math.random() * 256);
    let current = (start + seedValue) % 256;
    let feedback = start;
    const output = new Uint8Array(inputBytes.length);

    for (let i = 0; i < inputBytes.length; i++) {
        const k = (current + feedback + i) % 256;
        const c = (inputBytes[i] + k) % 256;
        output[i] = c;
        feedback = c;
        current = next(current, func);
    }

    return {
        start,
        cipherBytes: output
    };
}

document.getElementById('uploadBtn').addEventListener('click', async function () {
    const fileInput = document.getElementById('hwfile');
    const hakbunInput = document.getElementById('hakbun');
    const file = fileInput.files[0];
    const uploadBtn = this;

    //학번 입력 확인
    const hakbun = hakbunInput.value.trim();
    if (!hakbun) {
        alert("학번 이름을 입력해주세요.");
        return;
    }

    //파일 선택 확인
    if (!file) {
        alert("파일을 선택하세요.");
        return;
    }

    //파일 이름 설정
    const b4Name = file.name;
    const noDot = b4Name.split('.');
    noDot.pop();
    const FileName = `${hakbun}_${noDot.join('.')}`;

    uploadBtn.disabled = true;

    try {
        const fileBuffer = await file.arrayBuffer();
        const inputBytes = new Uint8Array(fileBuffer);
        const seed = hakbun.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 256;
        const encrypted = encryptBytes(inputBytes, PUBLIC_KEY, seed);

        const encryptedBlob = new Blob([encrypted.cipherBytes], { type: 'application/octet-stream' });
        const encryptedName = `${FileName}.enc`;

        // formData 설정
        const formData = new FormData();
        formData.append('hakbun', FileName);
        formData.append('hwfile', encryptedBlob, encryptedName);
        formData.append('cryptoStart', String(encrypted.start));
        formData.append('cryptoN', String(PUBLIC_KEY.n));
        formData.append('cryptoFuncId', PUBLIC_KEY.funcId);

        // 서버 파일 전송
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/upload`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '업로드 실패');
        }

        console.log('성공:', data);
        alert('암호화 후 업로드가 완료되었습니다.');
    } catch (error) {
        console.error('오류 발생:', error);
        alert('오류가 발생했습니다. 나중에 다시 시도해주세요.');
    } finally {
        // 요청 완료 후 버튼 활성화
        uploadBtn.disabled = false;
    }
});
