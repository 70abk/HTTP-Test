document.getElementById('uploadBtn').addEventListener('click', function () {
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

    //formData 설정
    const formData = new FormData();
    formData.append('hakbun', FileName); 
    formData.append('hwfile', file);
    uploadBtn.disabled = true;

    // 서버 파일 전송
    fetch('http://(IP)/upload', { // Change (IP) to your server IP
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('성공:', data);
            alert("업로드가 완료되었습니다.");
        })
        .catch((error) => {
            console.error('오류 발생:', error);
            alert("오류가 발생했습니다. 나중에 다시 시도해주세요.");

        })
        .finally(() => {
            // 요청 완료 후 버튼 활성화
            uploadBtn.disabled = false;
        });
});
