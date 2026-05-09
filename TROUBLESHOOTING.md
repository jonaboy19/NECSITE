# Troubleshooting

## Windows `spawn EPERM` when running Next.js

If `npm run dev` or `npm run build` fails with `Error: spawn EPERM`, the app code has usually compiled but Windows blocked a child process that Next.js needs to start.

Try these in order from a normal PowerShell terminal:

1. Close editors, terminals, and background Node processes using this repo.
2. Run PowerShell as your normal user, not from an agent/sandbox terminal.
3. Add the project folder and `node.exe` to Windows Security or antivirus exclusions.
4. Clear generated output with `Remove-Item -Recurse -Force .next`.
5. Reinstall dependencies with `npm ci`.
6. Run `npm run typecheck`, then `npm run dev`.

The repo also includes `npm run dev:webpack` and `npm run build:webpack` for a non-Turbopack fallback.
