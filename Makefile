BIN=node_modules/.bin
BAILEY=$(BIN)/bailey
MOCHA=$(BIN)/_mocha
ISTANBUL=$(BIN)/istanbul

SRC_FILES = $(shell find src/ -name "*.bs")
TEST_FILES = $(shell find test/ -name "*.bs")

all: node_modules dist
compile: node_modules dist
production: clean install compile forever

test: compile dist/test
	FRIGG_WORKER_TOKEN=token $(ISTANBUL) cover $(MOCHA) dist/test

dist: $(SRC_FILES)
	$(BAILEY) -c server

dist/test: $(TEST_FILES)
	$(BAILEY) -c server-test

cobertura:
	$(ISTANBUL) report cobertura

forever: compile
	forever restart $(shell pwd)/index.js

full-clean: clean
	rm -rf node_modules

clean:
	rm -rf dist

node_modules:
	npm install

install:
	npm install

.PHONY: compile clean full-clean forever production client
