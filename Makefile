.PHONY: build deps test unit_test browser_test watch

build: deps
	npx ohm generateBundles --withTypes *.ohm
	npx prettier --write grammar.ohm-bundle.d.ts grammar.ohm-bundle.js
	npx esbuild index.ts --outfile=index.js --bundle --sourcemap --loader:.ohm=text --loader:.txt=text

watch: deps
	npx esbuild index.ts --outfile=index.js --bundle --sourcemap --loader:.ohm=text --loader:.txt=text --watch

test: unit_test browser_test

unit_test:
	deno test --allow-read utils_test.ts parser_test.ts

browser_test:
	PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@16.2.0/install.ts
	deno test --allow-env --allow-net --allow-read --allow-run --allow-write browser_test.ts

deps:
	npm install --save-exact --save-dev --prefix=.
