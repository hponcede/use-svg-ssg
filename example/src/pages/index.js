import React from 'react'
import { Link } from '../components/Router'
import { useSvg, SvgCatalog, } from "use-svg-ssg"

import Circle from '../assets/circle.svg'


export default () => {

  const SquareItem = useSvg('square') // defined in App.js
  const CircleItem = useSvg('circle')


  return (
    <div>
      <div>
        <Link to="/page2">Got to second page</Link>
      </div>


      <div style={{marginTop: "2rem"}}>
        <SquareItem/>
        <CircleItem/>
      </div>

      <SvgCatalog>
        <Circle id="circle"/>
      </SvgCatalog>


    </div>
  )

}


