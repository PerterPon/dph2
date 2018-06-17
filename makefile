
DIRNAME = $(PWD)
MOCHA = $(DIRNAME)/node_modules/.bin/mocha
PM2 = $(DIRNAME)/node_modules/.bin/pm2
ISTANBUL = $(DIRNAME)/node_modules/.bin/istanbul
_MOCHA = $(DIRNAME)/node_modules/.bin/_mocha

BUILD_FOLDER = $(DIRNAME)/build
TEST_FOLDER = $(DIRNAME)/test_output

build-ts:
	rm -rf $(BUILD_FOLDER)
	tsc
	cp -r $(DIRNAME)/etc $(BUILD_FOLDER)
build-test:
	rm -rf $(TEST_FOLDER)
	tsc --outDir $(TEST_FOLDER)
	cp -r $(DIRNAME)/etc $(TEST_FOLDER)

test: build-test
	cd $(TEST_FOLDER) && \
	$(MOCHA) tests/test-*.js

test-cov: build-test
	cd $(TEST_FOLDER) && \
	$(ISTANBUL) cover $(_MOCHA) tests/test-*.js
	open $(TEST_FOLDER)/coverage/lcov-report/index.html
