# Dynamic Open Graph (OG) Image Generation

This project can be extended with dynamic social card images. Vercel provides the [`@vercel/og`](https://vercel.com/docs/functions/og-image-generation) library that runs in Edge Functions and lets you generate images on the fly. A ready-made `api/og.mjs` file is included in this repository as a starting point

## Install the library
    
```bash
npm install @vercel/og
```

## Example Vercel Function

Create a file called `api/og.mjs` in your project root when deploying to Vercel:

```javascript
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Digital Modenhet";

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          color: "black",
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {title}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

Deploy the project on Vercel and visit `/api/og?title=Hello` to generate a card with the text "Hello".

## Usage in HTML

Reference the function from your `<head>` tags:

```html
<meta property="og:image" content="https://your-vercel-app.vercel.app/api/og?title=Your%20Title" />
```

The URL parameters allow you to adjust the text or other values dynamically.
