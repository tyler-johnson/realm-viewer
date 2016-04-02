BIN = ./node_modules/.bin
SRC = $(wildcard src/* src/*/*)
TEST = $(wildcard test/* test/*/*)

build: index.js cli.js

index.js: src/index.js $(SRC)
	$(BIN)/rollup $< -c > $@

cli.js: src/cli.js $(SRC)
	echo "#!/usr/bin/env node" > $@
	$(BIN)/rollup $< -c >> $@
	chmod +x $@

test.js: test/index.js $(TEST)
	$(BIN)/rollup $< -c > $@

test: test.js
	node $<

clean:
	rm -rf index.js test.js cli.js

.PHONY: build clean test
