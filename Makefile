BIN = ./node_modules/.bin
SRC = $(wildcard src/* src/*/*)

build: index.js cli.js

index.js: src/index.js $(SRC)
	$(BIN)/rollup $< -c -f cjs > $@

cli.js: src/cli.js $(SRC)
	echo "#!/usr/bin/env node" > $@
	TARGET=node $(BIN)/rollup $< -c -f cjs >> $@

clean:
	rm -rf index.js cli.js

.PHONY: build
