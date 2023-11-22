chunk ack 尽可能保证数据不丢

embed add(chunk); emit(chunk); check timeout; 👇 mirror recv(chunk); ack(chunk); check apply; 👇 embed recv(ack); delete(chunk)
