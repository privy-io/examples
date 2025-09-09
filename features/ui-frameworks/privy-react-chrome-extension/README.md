# Chrome Extension Starter (CRA + Privy)

This is a Chrome extension built using the Create React App starter, with Privy authentication and access to Privy features. Please follow the official guide to understand and extend the integration: [Privy Chrome Extension recipe](https://docs.privy.io/recipes/react/chrome-extension).

There is an `options.html` which opens as a browser page, and a separate login auth popup useful for social auth flows.

## Prerequisites

- Privy App ID available as env var `REACT_APP_PRIVY_APP_ID`

## Setup

1. Install deps

```bash
pnpm install
```

2. Set env (create `.env` in project root):

```bash
REACT_APP_PRIVY_APP_ID=your_app_id_here
```

3. Build

```bash
pnpm build
```

4. Load in Chrome

- Open chrome://extensions
- Enable Developer mode
- Load unpacked → select `my-extension/build`

## Development

Run CRA dev server if you want to iterate on UI quickly:

```bash
pnpm start
```

Note: For actual extension testing, use `pnpm build` then reload the unpacked extension.
