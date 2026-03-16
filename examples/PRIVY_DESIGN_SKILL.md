# Privy Design Skill

## 1. Overview & Usage

Include this document as context in your prompt alongside feature docs. Tell Claude: "Use this Privy design skill for the UI." The result will be a demo app that matches Privy's visual identity — colors, fonts, component patterns, and layout — without manually specifying design tokens each time.

All values are extracted from [privy-next-starter](https://github.com/privy-io/examples/tree/main/privy-next-starter), the canonical Privy example app.

---

## 2. Tech Stack

- **Framework:** Next.js 15+ App Router, TypeScript
- **Styling:** Tailwind CSS v4 (with `@tailwindcss/postcss`)
- **Auth:** `@privy-io/react-auth` ^3.12.0
- **Icons:** `@heroicons/react` ^2.2.0
- **Notifications:** `react-toastify` ^11.0.5
- **Package manager:** `pnpm`
- **Dev server:** Turbopack (`next dev --turbopack`)

---

## 3. Color System

### Brand

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#5B4FFF` | Buttons, links, borders, focus rings |
| Primary hover | `#4A3EE6` | `.button-primary` hover/focus, `.button-outline` active |
| Primary active | `#3F35D9` | `.button-primary` active state |
| Logo/dark | `#010110` | Dark logo fill |

### Neutrals

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#ffffff` | Page background (CSS var `--background`) |
| Foreground | `#171717` | Body text color (CSS var `--foreground`) |
| Text dark | `#040217` | `.button` text color |
| Borders | `#E2E3F0` | `.button` border, header border, sidebar border |
| Light bg | `#E0E7FF66` | Authenticated page background (with alpha) |
| Code/pre bg | `#F1F2F9` | JSON display, code blocks |
| Badge/highlight bg | `#E0E7FF` | Section file path badges |
| Loader fill | `#E1E4FF` | Fullscreen loader SVG fill |

### Status

Success, warning, and error states are handled via `react-toastify` toast notifications — no custom status colors needed.

---

## 4. Typography

### Fonts

| Font | File | CSS Variable | Usage |
|------|------|-------------|-------|
| **Inter** | `InterVariable.ttf` | `--font-inter` | Body text, UI elements |
| **ABC Favorit Medium** | `ABCFavorit-Medium.woff2` | `--font-abc-favorit` | Hero headings, branded pill badges |

- **Fallback stack:** Arial, Helvetica, sans-serif
- Body uses `font-family: var(--font-inter)` on `<body>`
- ABC Favorit is used for: hero headings (`font-abc-favorit`), pill badges on the landing page

### Font Loading Pattern (layout.tsx)

```tsx
import localFont from "next/font/local";

const inter = localFont({
  src: "../../public/fonts/InterVariable.ttf",
  variable: "--font-inter",
  display: "swap",
});

const abcFavorit = localFont({
  src: "../../public/fonts/ABCFavorit-Medium.woff2",
  variable: "--font-abc-favorit",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${abcFavorit.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 5. globals.css Template

Copy-pasteable. Drop this into `src/app/globals.css`:

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
  --font-abc-favorit: var(--font-abc-favorit);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-inter), Arial, Helvetica, sans-serif;
}

@layer components {
  .button-primary {
    @apply bg-[#5B4FFF] hover:bg-[#4A3EE6] focus:bg-[#4A3EE6] active:bg-[#3F35D9]
           disabled:bg-gray-300 disabled:cursor-not-allowed
           text-white font-medium
           px-4 py-2 rounded-md
           border border-transparent
           transition-colors duration-200 ease-in-out
           focus:outline-none focus:ring-2 focus:ring-[#5B4FFF] focus:ring-offset-2
           inline-flex items-center justify-center
           text-sm leading-5 cursor-pointer;
  }

  .button-outline {
    @apply flex flex-row items-center
           px-4 py-2 gap-1 cursor-pointer
           h-9 rounded-full
           bg-transparent border border-[#5B4FFF]
           text-[#5B4FFF] font-medium text-sm leading-tight
           hover:bg-[#5B4FFF] hover:text-white
           focus:bg-[#5B4FFF] focus:text-white
           active:bg-[#4A3EE6]
           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
           transition-all duration-200 ease-in-out
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .button {
    @apply flex flex-row items-center
           px-3 py-2 gap-3 cursor-pointer
           bg-white border border-[#E2E3F0] rounded-xl
           text-[#040217] font-normal text-base leading-6
           hover:bg-gray-50 hover:border-gray-300
           focus:bg-gray-50 focus:border-gray-300
           active:bg-gray-100
           focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
           transition-all duration-200 ease-in-out
           disabled:opacity-50 disabled:cursor-not-allowed
           box-border;
  }

  .text-primary {
    @apply text-[#5B4FFF];
  }
  .border-primary {
    @apply border-[#5B4FFF];
  }

  .loader-overlay {
    @apply absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-white/30;
    animation: fade-in 150ms ease-in forwards;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

---

## 6. tailwind.config.js Template

Copy-pasteable. Drop this into `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "Helvetica", "sans-serif"],
        "abc-favorit": ["var(--font-abc-favorit)", "Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

---

## 7. Layout Patterns

### Header (`components/ui/header.tsx`)

- **Height:** 60px, fixed position, `z-50`
- **Authenticated state:** `bg-white border-b border-[#E2E3F0]` with dark logo
- **Unauthenticated state:** `bg-transparent border-none` with light logo, overlays on hero
- **Left side:** Logo image + pill badge (`rounded-[11px] border border-primary text-primary` with `text-[0.75rem]`)
- **Right side:** Docs link (`text-primary` + `ArrowUpRightIcon`) + Dashboard CTA (`button-primary rounded-full`, `hidden md:block`)

```tsx
import { ArrowRightIcon, ArrowUpRightIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

interface HeaderProps {
  authenticated: boolean;
}

export function Header({ authenticated }: HeaderProps) {
  return (
    <header
      className={`fixed top-0 left-0 w-full h-[60px] flex flex-row justify-between items-center px-6 z-50 ${
        authenticated
          ? "bg-white border-b border-[#E2E3F0]"
          : "bg-transparent border-none backdrop-blur-none"
      }`}
    >
      <div className="flex flex-row items-center gap-2 h-[26px]">
        <Image
          src={authenticated ? "./privy-logo-black.svg" : "./privy-logo-white.svg"}
          alt="Privy Logo"
          width={104}
          height={23}
          className="w-[103.48px] h-[23.24px]"
          priority
        />

        {authenticated && (
          <div
            className={`text-medium flex h-[22px] items-center justify-center rounded-[11px] border px-[0.375rem] text-[0.75rem] ${
              authenticated
                ? "border-primary text-primary"
                : "border-white text-white"
            }`}
          >
            Next.js Demo
          </div>
        )}
      </div>

      <div className="flex flex-row justify-end items-center gap-4 h-9">
        <a
          className={`flex flex-row items-center gap-1 cursor-pointer ${
            authenticated ? "text-primary" : "text-white"
          }`}
          href="https://docs.privy.io/basics/react/installation"
          target="_blank"
          rel="noreferrer"
        >
          Docs <ArrowUpRightIcon className="h-4 w-4" strokeWidth={2} />
        </a>

        <button className="button-primary rounded-full hidden md:block">
          <a
            className="flex flex-row items-center gap-2"
            href="https://dashboard.privy.io/"
            target="_blank"
            rel="noreferrer"
          >
            <span> Go to dashboard</span>
            <ArrowRightIcon className="h-4 w-4" strokeWidth={2} />
          </a>
        </button>
      </div>
    </header>
  );
}
```

### Hero / Landing (Unauthenticated)

- Full-screen with `BG.svg` background image (`fill`, `objectFit: "cover"`)
- Centered column layout, `z-10`
- Pill badge: `rounded-[20px] border border-white px-6 text-lg text-white font-abc-favorit`
- Heading: `text-7xl font-medium font-abc-favorit leading-[81.60px] text-white`
- Subtitle: `text-xl font-normal text-white leading-loose`
- CTA button: `bg-white text-brand-off-black rounded-full px-4 py-2 hover:bg-gray-100` — scales up at `lg:` breakpoint

```tsx
<section className="w-full flex flex-row justify-center items-center h-screen relative">
  <Image
    src="./BG.svg"
    alt="Background"
    fill
    style={{ objectFit: "cover", zIndex: 0 }}
    priority
  />
  <div className="z-10 flex flex-col items-center justify-center w-full h-full">
    <div className="flex h-10 items-center justify-center rounded-[20px] border border-white px-6 text-lg text-white font-abc-favorit">
      Next.js Demo
    </div>
    <div className="text-center mt-4 text-white text-7xl font-medium font-abc-favorit leading-[81.60px]">
      Starter repo
    </div>
    <div className="text-center text-white text-xl font-normal leading-loose mt-8">
      Get started developing with Privy using our Next.js starter repo
    </div>
    <button
      className="bg-white text-brand-off-black mt-15 w-full max-w-md rounded-full px-4 py-2 hover:bg-gray-100 lg:px-8 lg:py-4 lg:text-xl"
      onClick={login}
    >
      Get started
    </button>
  </div>
</section>
```

### Authenticated Layout

- Two-column: scrollable left content + fixed right sidebar
- Outer wrapper: `bg-[#E0E7FF66] md:max-h-[100vh] md:overflow-hidden`
- Left column: `flex-grow overflow-y-auto h-full p-4 pl-8`
- Right column: `UserObject` panel — `w-full md:w-[400px] bg-white border-l border-[#E2E3F0]`
- Content area offset by header: `pt-[60px]`

```tsx
<section className="w-full flex flex-col md:flex-row h-screen pt-[60px]">
  <div className="flex-grow overflow-y-auto h-full p-4 pl-8">
    <button className="button" onClick={logout}>
      <ArrowLeftIcon className="h-4 w-4" strokeWidth={2} /> Logout
    </button>
    <div>
      {/* Section components go here */}
    </div>
  </div>
  <UserObject />
</section>
```

### Footer

The starter does not include a footer. If adding one, keep it minimal and consistent with the neutral border/background system.

---

## 8. Component Patterns

### Buttons (3 variants from globals.css)

| Class | Style | Shape | States |
|-------|-------|-------|--------|
| `.button-primary` | Solid `#5B4FFF`, white text | `rounded-md` | hover `#4A3EE6`, active `#3F35D9`, focus ring `#5B4FFF`, disabled `bg-gray-300` |
| `.button-outline` | Transparent, `#5B4FFF` border + text | `rounded-full` | hover/focus inverts to solid `#5B4FFF` + white text, active `#4A3EE6`, disabled `opacity-50` |
| `.button` | White bg, `#E2E3F0` border | `rounded-xl` | hover `bg-gray-50`, active `bg-gray-100`, disabled `opacity-50` |

All buttons include `transition-colors` or `transition-all` at `duration-200 ease-in-out` and `disabled:cursor-not-allowed`.

### Section (`components/reusables/section.tsx`)

Reusable content section with title, file path badge, description, and action buttons:

```tsx
interface IAction {
  name: string;
  function: () => void;
  disabled?: boolean;
}

interface ISection {
  name: string;
  description?: string;
  filepath?: string;
  actions: IAction[];
  children?: React.ReactNode;
}

const Section = ({ name, description, filepath, actions, children }: ISection) => {
  return (
    <div className="py-4 my-4">
      <div className="flex flex-col md:flex-row gap-2 md:items-center my-4">
        <h3 className="text-[20px] font-semibold">{name}</h3>
        <p className="bg-[#E0E7FF] px-2 py-1 rounded-md text-[14px] w-fit">
          @{filepath}
        </p>
      </div>
      <p className="text-[16px] font-light">{description}</p>

      {children && <div className="my-4">{children}</div>}

      <div className="flex flex-row flex-wrap gap-2 my-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.function}
            disabled={action.disabled}
            className={`button ${
              action.disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {action.name}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### Badge (`components/ui/badge.tsx`)

Variants: `default`, `success`, `warning`, `destructive`, `outline`. Uses a CSS class mapping (not CVA). Class joining via array `.join(" ")`:

```tsx
type BadgeVariant = "default" | "success" | "warning" | "destructive" | "outline";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantToClasses: Record<BadgeVariant, string> = {
  default: "badge",
  success: "badge badge-success",
  warning: "badge badge-warning",
  destructive: "badge badge-destructive",
  outline: "badge badge-outline",
};

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={[variantToClasses[variant], className ?? ""].join(" ")}
      {...props}
    />
  );
}
```

### UserObject Panel (`components/sections/user-object.tsx`)

Fixed-width right sidebar showing user JSON:

```tsx
const UserObject = () => {
  const { user } = usePrivy();
  return (
    <div className="w-full md:w-[400px] bg-white flex flex-col gap-2 border-l border-[#E2E3F0] p-4 h-[calc(100vh-60px)]">
      <h3 className="text-md font-semibold">User object</h3>
      <pre className="bg-[#F1F2F9] p-2 overflow-y-auto rounded-lg flex-1 text-xs font-light whitespace-pre-wrap">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
};
```

### FullScreen Loader (`components/ui/fullscreen-loader.tsx`)

Uses `.loader-overlay` wrapper with an animated Privy blob SVG (72x72px, fill `#E1E4FF`):

```tsx
export const FullScreenLoader = () => {
  return (
    <div className="loader-overlay">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width="72px"
        height="72px"
        viewBox="0 0 59 59"
        className="overflow-visible"
      >
        <g>
          <path
            className="animate-bounce"
            stroke="none"
            fillRule="nonzero"
            fill="#E1E4FF"
            d="M 28.746094 0.015625 C 28.359375 0.03125 27.722656 0.0703125 27.363281 0.105469 C 22.929688 0.515625 18.730469 2.207031 15.242188 4.992188 C 10.347656 8.894531 7.28125 14.597656 6.730469 20.804688 C 6.667969 21.515625 6.648438 21.972656 6.648438 22.863281 C 6.648438 23.753906 6.667969 24.207031 6.730469 24.929688 C 7.152344 29.683594 9.066406 34.183594 12.210938 37.816406 C 13.949219 39.832031 16.046875 41.53125 18.394531 42.84375 C 18.953125 43.15625 19.9375 43.636719 20.53125 43.890625 C 22.722656 44.820312 25.042969 45.40625 27.398438 45.617188 C 28.769531 45.746094 30.207031 45.746094 31.578125 45.617188 C 35.304688 45.28125 38.875 44.035156 42.035156 41.964844 C 43.890625 40.75 45.613281 39.210938 47.058594 37.476562 C 49.902344 34.066406 51.683594 29.910156 52.1875 25.5 C 52.386719 23.769531 52.386719 21.882812 52.179688 20.144531 C 51.65625 15.714844 49.839844 11.539062 46.96875 8.132812 C 46.183594 7.207031 45.144531 6.164062 44.21875 5.382812 C 42.054688 3.558594 39.523438 2.128906 36.859375 1.222656 C 34.933594 0.570312 33.109375 0.207031 31.019531 0.0585938 C 30.558594 0.0234375 29.148438 -0.00390625 28.746094 0.015625 Z M 28.746094 0.015625"
          />
          <path
            className="animate-blobby-pulse"
            stroke="none"
            fillRule="nonzero"
            fill="#E1E4FF"
            d="M 27.191406 52.46875 C 20.148438 52.691406 14.652344 53.902344 13.953125 55.386719 C 13.894531 55.519531 13.882812 55.566406 13.882812 55.722656 C 13.882812 55.886719 13.890625 55.921875 13.960938 56.0625 C 14.652344 57.472656 19.667969 58.636719 26.300781 58.929688 C 32.234375 59.195312 38.464844 58.695312 42.054688 57.664062 C 43.746094 57.175781 44.730469 56.644531 45.023438 56.050781 C 45.085938 55.925781 45.09375 55.882812 45.09375 55.722656 C 45.09375 55.457031 45.011719 55.285156 44.757812 55.035156 C 44.535156 54.8125 44.269531 54.636719 43.878906 54.441406 C 41.730469 53.378906 37.152344 52.636719 31.660156 52.464844 C 30.820312 52.441406 28.054688 52.441406 27.191406 52.46875 Z M 27.191406 52.46875"
          />
        </g>
      </svg>
    </div>
  );
};
```

### Privy Logo (`components/ui/privy-logo.tsx`)

SVG component with `useLightLogo` boolean prop. Light: `fill="#ffffff"`, Dark: `fill="#010110"`. ViewBox: `0 0 188 42`.

```tsx
export function PrivyLogo(
  props: { useLightLogo?: boolean } & React.SVGProps<SVGSVGElement>
) {
  const fill = props.useLightLogo ? "#ffffff" : "#010110";
  return (
    <svg
      width="188"
      height="42"
      viewBox="0 0 188 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Full SVG paths — see privy-next-starter/src/components/ui/privy-logo.tsx */}
      <path fillRule="evenodd" clipRule="evenodd" d="M137.815 22.3208H137.245L129.838 0.839355H121.161V1.7275L131.611 31.7261H143.134L153.587 1.7275V0.839355H145.288L137.811 22.3208H137.815Z" fill={fill} />
      <path d="M118.852 0.839355H110.224V31.7229H118.852V0.839355Z" fill={fill} />
      <path fillRule="evenodd" clipRule="evenodd" d="M179.217 0.836017H179.223L171.747 22.324H171.178L163.77 0.83927H155.094V1.73393L166.444 34.3254H155.696V41.4794H166.2C170.687 41.4794 174.181 39.9666 175.876 35.1387C176.104 34.4946 187.516 1.72742 187.516 1.72742V0.832764H179.217V0.836017Z" fill={fill} />
      <path fillRule="evenodd" clipRule="evenodd" d="M66.2556 0C62.3322 0 58.6657 1.99752 56.3786 5.75182H55.8483V0.871882H47.624V41.4697H56.3624V27.7929H56.8992C56.9577 27.8742 57.0163 27.9588 57.0748 28.0271C58.5486 29.8197 61.9906 32.5524 66.2719 32.5524C74.0635 32.5524 79.3924 25.8181 79.3924 16.2795C79.3924 6.74082 73.8 0 66.2556 0ZM63.6465 25.8572C59.5799 25.8572 56.7723 22.6885 56.7723 16.2827C56.7723 9.87699 59.5799 6.70829 63.6465 6.70829C67.7131 6.70829 70.6573 9.94531 70.6573 16.2827C70.6573 22.6201 67.7814 25.8572 63.6465 25.8572Z" fill={fill} />
      <path fillRule="evenodd" clipRule="evenodd" d="M101.065 0.83606C97.0148 0.83606 94.4154 1.51274 92.8961 5.75178H92.3756V0.839313H79.8667V7.93149H82.658C83.5787 7.93149 84.0309 8.25682 84.148 9.01158V14.9065H84.1806V31.7261H92.9189V15.3425C92.9189 11.1002 94.0706 8.50081 98.3129 8.50081H107.468V0.83606H101.068H101.065Z" fill={fill} />
      <path d="M16.7503 32.5428C25.7327 32.5428 33.0168 25.2587 33.0168 16.2763C33.0168 7.29401 25.7327 0.0098877 16.7503 0.0098877C7.76801 0.0098877 0.483887 7.29401 0.483887 16.2763C0.483887 25.2587 7.76801 32.5428 16.7503 32.5428Z" fill={fill} />
      <path d="M16.7508 42.0001C22.8897 42.0001 27.8673 40.9525 27.8673 39.6674C27.8673 38.3824 22.893 37.3348 16.7508 37.3348C10.6086 37.3348 5.63428 38.3824 5.63428 39.6674C5.63428 40.9525 10.6086 42.0001 16.7508 42.0001Z" fill={fill} />
    </svg>
  );
}
```

### Toast Notifications

`react-toastify` with `<ToastContainer>` at top-center, positioned below the header:

```tsx
<ToastContainer
  position="top-center"
  autoClose={5000}
  hideProgressBar
  newestOnTop={false}
  closeOnClick={false}
  rtl={false}
  pauseOnFocusLoss
  draggable={false}
  pauseOnHover
  limit={1}
  aria-label="Toast notifications"
  style={{ top: 58 }}
/>
```

---

## 9. Icon System

- **Package:** `@heroicons/react/16/solid` (small, filled icons)
- **Size:** `h-4 w-4` with `strokeWidth={2}`
- **Icons used:**
  - `ArrowLeftIcon` — back navigation, logout
  - `ArrowRightIcon` — forward CTA (dashboard button)
  - `ArrowUpRightIcon` — external links (docs)

---

## 10. Responsive Patterns

- **Approach:** Mobile-first Tailwind
- **`md:` breakpoint:** Two-column layout, header CTA visibility
- **`lg:` breakpoint:** Button size scaling on hero

| Element | Mobile | `md:` | `lg:` |
|---------|--------|-------|-------|
| Auth layout | `flex-col` | `flex-row` | — |
| Header dashboard button | `hidden` | `block` | — |
| Hero CTA | `px-4 py-2` | — | `px-8 py-4 text-xl` |
| Section header | `flex-col` | `flex-row items-center` | — |
| Container | Full-width with padding | — | — |

No explicit `max-width` constraint on content areas.

---

## 11. Dependencies

### package.json (core dependencies)

```json
{
  "dependencies": {
    "@heroicons/react": "^2.2.0",
    "@privy-io/react-auth": "^3.12.0",
    "next": "15.5.7",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-toastify": "^11.0.5"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

Additional dependencies in the starter for Solana/Ethereum wallet functionality: `viem`, `@solana/kit`, `@solana-program/*`, `bs58`. Include these only if your demo needs on-chain interactions.

---

## 12. Provider Setup Pattern

```tsx
"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
        appearance: { walletChainType: "ethereum-and-solana" },
        externalWallets: { solana: { connectors: toSolanaWalletConnectors() } },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
```

**Environment variable:** `NEXT_PUBLIC_PRIVY_APP_ID` — required, set in `.env`.

---

## 13. Do's and Don'ts

### Do

- Use the 3 button classes from globals.css: `.button-primary`, `.button-outline`, `.button`
- Use `#5B4FFF` as the primary brand color everywhere
- Use Inter for body text, ABC Favorit for display headings and branded badges
- Use `#E2E3F0` for borders, `#E0E7FF` for highlight backgrounds
- Use `react-toastify` for notifications, `@heroicons/react` for icons
- Use Tailwind utility classes for layout and spacing
- Use `pnpm` as the package manager
- Use the `font-abc-favorit` Tailwind class for branded display text

### Don't

- Use shadcn/ui, @radix-ui, class-variance-authority, clsx, or tailwind-merge
- Add dark mode (not part of the design system)
- Use heavy shadows or complex gradients
- Create custom component abstractions — keep it simple with Tailwind + the 3 button classes
- Use `npm` or `yarn` — use `pnpm`

---

## Source Reference

All values extracted from [privy-next-starter](https://github.com/privy-io/examples/tree/main/privy-next-starter) at commit `38955b0`:

| File | What's extracted |
|------|-----------------|
| `src/app/globals.css` | CSS variables, button classes, animations |
| `src/app/layout.tsx` | Font loading, body setup |
| `src/app/page.tsx` | Hero page, auth layout, toast config |
| `tailwind.config.js` | Font families, content paths |
| `package.json` | Dependencies |
| `src/components/ui/header.tsx` | Header component |
| `src/components/ui/badge.tsx` | Badge variants |
| `src/components/ui/fullscreen-loader.tsx` | Loader SVG |
| `src/components/ui/privy-logo.tsx` | Logo SVG with light/dark |
| `src/components/reusables/section.tsx` | Section layout pattern |
| `src/components/sections/user-object.tsx` | JSON sidebar panel |
| `src/providers/providers.tsx` | PrivyProvider config |
