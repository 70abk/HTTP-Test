import math

class sequence:
    def __init__(self, func, init=1):
        self.seq = [init]
        self.index = 1
        self.func = func
    def call(self, index):
        if type(index) != int:
            raise TypeError("Index must be an integer")
            return None
        while self.index <= index:
            self.seq.append(self.func(self.seq[-1]))
            self.index += 1
        return self.seq[index-1]
        
sequence1 = sequence(lambda x: 2*x*math.sin(x) + x*math.cos(x**2), init=30) # (x^3)*sin(x) + x*cos(x^2)

if __name__ == "__main__":
    print(sequence1.call(50))
    print (sequence1.seq)