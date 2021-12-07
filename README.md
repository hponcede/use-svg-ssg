# use-svg-ssg

> Bundle your SVG files properly without clogging up the HTML

[![NPM](https://img.shields.io/npm/v/use-svg-ssg.svg)](https://www.npmjs.com/package/use-svg-ssg) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-svg-ssg
```

## Usage

**Warning.** This module has been tested with `react-static`. It has yet to be tested with other SSG generators.

**Warning.** Still under development. Not to be used in production.

When building an SSG site, loaded SVG files are written inside the resuling HTML, resulting in a somewhat messy markup. This module aims at minimizing the presence of SVG markup in your HMTL by registering the SVG content inside your bundles and writing simple `<use href="#..."/>` SVG declarations inside the HTML markup.

First, load the context provider (SvgProvider) in your `App` file:

```jsx
import React from 'react'
import { SvgProvider } from 'use-svg-ssg'

export default function App() {
  return (
    <SvgProvider>
      ...
    </SvgProvider>
  )
}
```

Then, use the SvgCatalog in your page. It will hold the SVGs used in this specific page.

```jsx
import React from 'react'
import { useSvg, SvgCatalog } from "use-svg-ssg"
import Image from './assets/image.svg'

export default () => {

  // call the useSvg() hook.
  // It will retrieve the file registered in the <SvgCatalog/> component, by its ID
  const SvgImage = useSvg('some-image')

  return (
    <div>
      <div>
        <SvgImage/>
      </div>

      <SvgCatalog>
        {/* Register your SVG, give it an ID */}
        <Image id="some-image"/>
      </SvgCatalog>
    </div>
  )
}

```

You can declare the `SvgCatalog` component anywhere below the `SvgProvider` in you app tree. Any SVG registered inside the `SvgCatalog` will be made available to the `useSvg()` hook. You can register SVGs globally, per page or even within a component. The SVG declaration will live within the bundle

`useSvg()` returns a JSX component, you can style it as you wish:

```jsx
import React from 'react'
import { useSvg } from "use-svg-ssg"
import Logo from './assets/logo.svg'

export default () => {

  const MyLogo = useSvg('logo')

  return (
    <div>
      <Logo style={{fill: "green"}}/>
    </div>
  )
}

```
## License

MIT © [hponcede](https://github.com/hponcede)
