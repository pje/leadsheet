.PHONY: build deps test unit_test browser_test ohm_bundle watch

test_files=$(wildcard *test.ts **/*test.ts)
browser_test_files=browser_test.ts
unit_test_files=$(filter-out $(browser_test_files),$(test_files))

build: deps ohm_bundle
	npx esbuild --target=chrome58 index.ts --outfile=index.js --bundle --sourcemap --loader:.leadsheet=text

watch: deps ohm_bundle
	npx esbuild --target=chrome58 index.ts --outfile=index.js --bundle --sourcemap --loader:.leadsheet=text --watch

test: unit_test browser_test

unit_test: $(unit_test_files)
	deno test --allow-read $^

browser_test: $(browser_test_files)
	PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@16.2.0/install.ts
	deno test --allow-env --allow-net --allow-read --allow-run --allow-write $^

ohm_bundle: deps
	npx ohm generateBundles --esm --withTypes parser/*.ohm
	npx prettier --write parser/grammar.ohm-bundle.d.ts parser/grammar.ohm-bundle.js

deps:
	npm install --save-exact --save-dev --prefix=.
