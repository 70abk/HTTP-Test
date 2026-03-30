import math

class sequence:
    # a(n) = func(a(n-1))
    def __init__(self, func, init=1):
        self.seq = [init]
        self.index = 1
        self.func = func
    def call(self, index):
        if type(index) != int:
            raise TypeError("Index must be an integer")
        while self.index <= index:
            self.seq.append(self.func(self.seq[-1]))
            self.index += 1
        return self.seq[index-1]
        
def keygen_single(func, init, n=20):
    seq = sequence(func, init=init)

    y = seq.call(n)

    public_key = {
        "n": n,
        "y": abs(int(y)) % 256,
        "func": func
    }

    private_key = {
        "init": init,
        "func": func
    }

    return public_key, private_key

pub1, priv1 = keygen_single(
    lambda x: 2*x*math.sin(x) + x*math.cos(x**2), # 2x*sin(x) + x*cos(x^2)
    init=15
)

pub2, priv2 = keygen_single(
    lambda x: x + math.log(2 + (x**3) * math.exp(-x)), # x + log(2 + (x^3)*e^(-x))
    init=1
)

pub3, priv3 = keygen_single(
    lambda x: 2*x + 3, # 2x + 3
    init=1
)

def encrypt(message, public_key, func):
    current = public_key["y"]  # 시작값 (공개키에서 가져옴)

    encrypted = ""
    for c in message:
        k = abs(int(current)) % 256
        encrypted += chr((ord(c) + k) % 256)

        # 다음 키 생성
        current = func(current)

    return encrypted

def decrypt(cipher, private_key, n):
    seq = sequence(private_key["func"], init=private_key["init"])

    # 시작값 복원 (k₀)
    current = seq.call(n)

    message = ""
    for c in cipher:
        k = abs(int(current)) % 256
        message += chr((ord(c) - k) % 256)

        # 동일하게 다음 키 생성
        current = private_key["func"](current)

    return message

msg = "Hello"

enc1 = encrypt(msg, pub1, priv1["func"])
dec1 = decrypt(enc1, priv1, pub1["n"])

enc2 = encrypt(msg, pub2, priv2["func"])
dec2 = decrypt(enc2, priv2, pub2["n"])

enc3 = encrypt(msg, pub3, priv3["func"])
dec3 = decrypt(enc3, priv3, pub3["n"])

print(enc1, dec1)
print(enc2, dec2)
print(enc3, dec3)