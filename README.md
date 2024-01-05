# leadsheet
<div align="center">
  <img width="575" alt="screenshot" src="https://github.com/pje/leadsheet/assets/319655/b7def379-9bba-418a-8bcb-bf1f63a59029">
</div>

Build and open the reader app:
```bash
  brew install deno

  make build
  make test
  make watch
  open build/index.html
```

Install the vscode extension for syntax highlighting of .leadsheet files:
```
  make install_vscode_extension
```

To run/test/develop github actions locally:
```
  act -j test -W .github/workflows/all.yaml
```
