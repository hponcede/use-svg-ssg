import React from 'react'
import { Link } from '../components/Router'
import { useSvg, SvgCatalog, } from "use-svg-ssg"

import Triangle from '../assets/triangle.svg'


export default () => {

  const SquareItem = useSvg('square') // defined in App.js
  const TriangleItem = useSvg('triangle')

  return (
    <div>
      <div>
        <Link to="/">Got to first page</Link>
      </div>

      <div style={{marginTop: "2rem"}}>
        <SquareItem/>
        <TriangleItem/>
      </div>


      <SvgCatalog>
        <Triangle id="triangle"/>
      </SvgCatalog>


    </div>
  )

}


