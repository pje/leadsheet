# leadsheet
<div align="center">
  <img width="500" alt="screenshot" src="https://github.com/pje/leadsheet/assets/319655/e24c5774-1318-46a3-8efb-9867953e54ef">
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
