.PHONY: build clean deps lint test unit_test browser_test ohm_bundle watch install_vscode_extension uninstall_vscode_extension

test_files=$(shell find . -type f -name '*test.ts')
browser_test_files=./browser_test.ts
unit_test_files=$(filter-out $(browser_test_files),$(test_files))

build: deps ohm_bundle
	npx esbuild --target=chrome58 index.ts --outfile=index.js --bundle --sourcemap --loader:.leadsheet=text

watch: deps ohm_bundle
	npx esbuild --target=chrome58 index.ts --outfile=index.js --bundle --sourcemap --loader:.leadsheet=text --watch

lint:
	deno lint *.ts "**/*.ts" --ignore=node_modules,parser/grammar.ohm-bundle.d.ts
	deno task detect-cyclic-imports

test: unit_test browser_test

unit_test: $(unit_test_files)
	deno test --parallel --allow-read $^

browser_test: $(browser_test_files)
	PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@16.2.0/install.ts
	deno test --allow-env --allow-net --allow-read --allow-run --allow-write $^

ohm_bundle: deps
	npx ohm generateBundles --esm --withTypes parser/*.ohm
	npx prettier --write parser/grammar.ohm-bundle.d.ts parser/grammar.ohm-bundle.js

clean:
	rm -rf index.css index.css.map index.js index.js.map node_modules test-failure*.png

deps:
	npm install --save-exact --save-dev --prefix=.

install_vscode_extension: uninstall_vscode_extension
	cp -rv ./vscode_extension ~/.vscode/extensions/pje.leadsheet-0.0.1

uninstall_vscode_extension:
	rm -rf ~/.vscode/extensions/pje.leadsheet-*
