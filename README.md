# leadsheet
<div align="center">
  <img width="575" alt="screenshot" src="https://github.com/pje/leadsheet/assets/319655/17d463f7-476d-44d1-8b35-95bba2b89be6">
</div>

```bash
  brew install deno # only needed for tests

  make build
  make test
  make watch
  open index.html

  act -j test -W .github/workflows/test.yaml  # to run/test/develop github actions locally
  code --extensionDevelopmentPath=vscode_extension . # to develop with the (experimental) vscode syntax enabled for *.leadsheet files
```
