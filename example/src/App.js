import React from 'react'
import { Root, Routes } from 'react-static'
import { Router } from 'components/Router'


import { SvgProvider, SvgCatalog } from "use-svg-ssg"

import Square from './assets/square.svg'


function App() {
  return (
    <SvgProvider>
      <Root>
        <div className="content">
          <React.Suspense fallback={<em>Loading...</em>}>
            <Router>
              <Routes path="*" />
            </Router>
          </React.Suspense>
        </div>
      </Root>

      <SvgCatalog>
        {/* Square will be available globally */}
        <Square id="square"/>
      </SvgCatalog>

    </SvgProvider>
  )
}

export default App
