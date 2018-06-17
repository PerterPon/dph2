
DIRNAME = $(PWD)
MOCHA = $(DIRNAME)/node_modules/.bin/mocha
PM2 = $(DIRNAME)/node_modules/.bin/pm2
ISTANBUL = $(DIRNAME)/node_modules/.bin/istanbul
TSC = $(DIRNAME)/node_modules/.bin/tsc
_MOCHA = $(DIRNAME)/node_modules/.bin/_mocha

BUILD_FOLDER = $(DIRNAME)/build
TEST_FOLDER = $(DIRNAME)/test_output

build-ts:
	rm -rf $(BUILD_FOLDER)
	$(TSC)
	cp -r $(DIRNAME)/etc $(BUILD_FOLDER)

build-test:
	rm -rf $(TEST_FOLDER)
	$(TSC) --outDir $(TEST_FOLDER)
	cp -r $(DIRNAME)/etc $(TEST_FOLDER)

test: build-test
	cd $(TEST_FOLDER) && \
	$(MOCHA) tests/test-*.js

test-cov: build-test
	cd $(TEST_FOLDER) && \
	$(ISTANBUL) cover $(_MOCHA) tests/test-*.js

dev: build-ts
	node src/index.js

start: build-ts
	nohup node src/index.js &;

status:
	$(PM2) ls

restart:
	$(PM2) restart

