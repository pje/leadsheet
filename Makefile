.PHONY: build deps test watch

build:
	npx ohm generateBundles --withTypes *.ohm
	npx prettier --write grammar.ohm-bundle.d.ts grammar.ohm-bundle.js
	npx esbuild index.ts --outfile=index.js --bundle --sourcemap --loader:.ohm=text --loader:.txt=text

watch:
	npx esbuild index.ts --outfile=index.js --bundle --sourcemap --loader:.ohm=text --loader:.txt=text --watch

test:
	deno test --allow-read *test.ts

deps:
	npm install --save-exact --save-dev --prefix=.
