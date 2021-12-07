import React, { createContext, useReducer, useContext, useState, useEffect, useRef } from 'react'
import { createPortal } from "react-dom"
import atob from 'atob'
// import PropTypes from 'prop-types'


export { SvgProvider, useSvg, SvgCatalog }

const Context = createContext()

const initialState = {
	rerenders: 0,
	defs: {}
}


const extractXml = dataUri => {
	const data = dataUri.match(/^([a-z]+):([a-z0-9]+\/[a-z0-9+-]+);base64,(.+)/)
	// const scheme = data[1]
	// const type = data[2]
	const encoded = data[3]

	const xml = decodeURIComponent(escape(atob( encoded ))).trim();

	return xml
}


const extractDef = xml => {
	const m = xml.match(/<svg[^>]+>(.+)<\/svg>/s)

	return m ? m[1].trim() : ""
}


const extractProps = xml => {
	const m = xml.match(/<svg([^>]+)>/s)
	const props = {}

	if (m && m[1]) {
		const reg = new RegExp('\W*?(([^=\W]+="[^"]*")\W*)?', "gms")
		const chunks = m[1].trim().match(reg)

		chunks.forEach(c => {
			const [ attribute, ...v] = c.trim().split("=")

			if (!attribute) {
				return
			}

			const valueWithQuotes = v.join('=').trim()

			const value = valueWithQuotes.substring(1, valueWithQuotes.length - 1)

			props[ attribute ] = value
		})
	}

	return props
}


const reducer = (state, action) => {

	switch (action.type) {
		case 'ADD':
			const s = {...state}
			if (! s.defs[action.payload.id]) {
				s.defs[ action.payload.id ] = {
					def: action.payload.def,
					attrs: action.payload.attrs
				}
			}
			else {
				(process.env.NODE_ENV !== 'production') && console.log(`[SVG WARNING] Asset "${action.payload.id}" already exists. Not added.`)
			}
		return s

		case 'LOADED':
		return {...state, rerenders: state.rerenders + 1}

		default:
			throw new Error()
	}

}


const useSvg = (id) => {
	const { state } = useContext(Context)
	const [ attrs, setAttrs ] = useState({})
	const [ ready, setReady ] = useState(false)

	useEffect(() => {
		if (state.defs[id]) {
			setAttrs(state.defs[id].attrs)
			setReady(true)
		}
	}, [state.defs[id]])


	if (!ready) {
		return () => null
	}
	else {
		return props => (
			<svg {...attrs} {...props}>
				<use href={ "#" + id } />
			</svg>
		)
	}
}


const SvgCatalog = props => {

	const { state, dispatch } = useContext(Context)

	useEffect(() => {
		props.children.filter(c => c.props.id).forEach(c => {
			const xml = extractXml( c.type )
			const def = extractDef( xml )
			const svgAttributes = extractProps(xml)

			dispatch({
				type: 'ADD',
				payload: {
					id: c.props.id,
					def: def,
					attrs: svgAttributes
				}
			})

		})


		dispatch({
			type: 'LOADED'
		})

	}, [])


	return null
}


const SvgPortal = () => {
	const portalNode = useRef(null)
	const { state } = useContext(Context)
	const [ keys, setKeys ] = useState([])


	useEffect(() => {
		if (portalNode.current && state.rerenders) {
			setKeys( Object.keys(state.defs) )
		}
	}, [state.rerenders, portalNode.current])


	if (typeof document === "undefined") {
		return null
	}
	else {
		return createPortal(
			<div style={{display: 'none'}}
				className="svg-catalog-portal"
				ref={portalNode}
			>
				<svg xmlns="http://www.w3.org/2000/svg">
					<defs>
						{keys.map( (id, index) => <g key={index} id={id} dangerouslySetInnerHTML={{
							__html: state.defs[id].def
						}}/>)}
					</defs>
				</svg>
			</div>,
			document.body)
	}

}

const SvgProvider = props => {
	const [ state, dispatch ] = useReducer( reducer, initialState )

	return (
		<Context.Provider value={{ state, dispatch }}>
			{props.children}

			<SvgPortal/>
		</Context.Provider>
	)
}


// SvgCatalog.propTypes = {
//   children: PropTypes.element.isRequired
// }

// SvgProvider.propTypes = {
//   children: PropTypes.element.isRequired
// }