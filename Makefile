REPORTER = spec
SRC = lib/*.js

include node_modules/make-lint/index.mk

default: install

install: node_modules

node_modules: package.json
	@npm -s install

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require "should" \
		--reporter $(REPORTER) \
		--check-leaks \
		--recursive

test-cov: lib-cov
	@LIB_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@touch coverage.html
	@jscoverage lib lib-cov
	@open coverage.html

clean:
	@rm -rf node_modules coverage.html

.PHONY: install test test-cov lib-cov lint clean
