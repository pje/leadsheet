.PHONY: build clean deps lint fmt-check test unit_test browser_test ohm_bundle watch install_vscode_extension uninstall_vscode_extension

test_files=$(shell find . -type f -name '*test.ts' | grep -v node_modules)
browser_test_files=./browser_test.ts
unit_test_files=$(filter-out $(browser_test_files),$(test_files))
deno_allows=--allow-env --allow-net --allow-read --allow-run --allow-sys --allow-write

build: deps
	deno run $(deno_allows) build_config/build.ts build

watch: deps
	deno run $(deno_allows) build_config/build.ts watch

lint: typecheck
	deno lint --ignore=build,parser/grammar.ohm-bundle.d.ts
	npx stylelint "**/*.css"
	deno task detect-cyclic-imports

typecheck:
	deno check index.ts

fmt-check:
	deno fmt --check *.html *.ts "**/*.ts" --ignore="build,parser/grammar.ohm-bundle.d.ts"

test: unit_test browser_test

unit_test: $(unit_test_files)
	deno test --parallel --allow-read $^

browser_test: $(browser_test_files)
	deno test --trace-leaks $(deno_allows) $^

clean:
	rm -rf build/* node_modules test-*.png

deps:
	npm install --save-exact --save-dev --prefix=.
	PUPPETEER_PRODUCT=chrome deno run -A https://raw.githubusercontent.com/pje/deno-puppeteer/refs/heads/main/install.ts

install_vscode_extension: uninstall_vscode_extension
	cp -rv ./vscode_extension ~/.vscode/extensions/pje.leadsheet-0.0.1

uninstall_vscode_extension:
	rm -rf ~/.vscode/extensions/pje.leadsheet-*
