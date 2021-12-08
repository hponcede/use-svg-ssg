import React, { createContext, useReducer, useContext, useState, useEffect, useRef } from 'react'
import atob from 'atob'
import { renderToStaticMarkup } from 'react-dom/server'

export { SvgProvider, useSvg, SvgCatalog }

const Context = createContext()

const initialState = {
	rerenders: 0,
	defs: {}
}


const devLog = (message) => {
	if (process.env.NODE_ENV !== 'production') {
		console.log("[SVG] " + message)
	}
}

const extractXmlFromDataUri = dataUri => {
	const data = dataUri.match(/^([a-z]+):([a-z0-9]+\/[a-z0-9+-]+);base64,(.+)/)

	if (data) {
		// const scheme = data[1]
		// const type = data[2]
		const encoded = data[3]

		return decodeURIComponent(escape(atob( encoded ))).trim();
	}

	return ""
}


const extractDefFromXml = xml => {
	const m = xml.match(/<svg[^>]+>(.+)<\/svg>/s)

	return m ? m[1].trim() : ""
}


const extractPropsFromXml = xml => {
	const m = xml.match(/<svg([^>]+)>/s)
	const props = {}

	if (m && m[1]) {
		const reg = new RegExp('\W*?(([^=\W]+="[^"]*")\W*)?', "gms")
		const chunks = m[1].trim().match(reg)

		if (chunks) {
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
				devLog(`Asset "${action.payload.id}" already exists. Not added.`)
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

	if (!ready || typeof document === 'undefined') {
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

	const { dispatch } = useContext(Context)

	useEffect(() => {
		let children = props.children

		if (typeof props.children.filter === 'undefined') {
			children = [props.children]
		}

		children.filter(c => c.props.id).forEach(c => {
			let def = ""
			let svgAttributes = {}
			let xml = ""

			switch (typeof c.type) {

				case 'string':
					xml = extractXmlFromDataUri( c.type )
					if (xml) {
						def = extractDefFromXml( xml )
						svgAttributes = extractPropsFromXml(xml)
					}
				break

				case 'function':
					const str = renderToStaticMarkup(<c.type {...c.props}/>)
					if (str) {
						def = extractDefFromXml( str )
					}

					if ("defaultProps" in c.type && typeof c.type.defaultProps === 'object') {
						svgAttributes = c.type.defaultProps
					}
				break

				default:
					devLog('Unsupported Type for #' + c.props.id)
			}


			if (def) {
				dispatch({
					type: 'ADD',
					payload: {
						id: c.props.id,
						def: def,
						attrs: svgAttributes
					}
				})
			}
			else {
				devLog('No def retrieved from SVG #' + c.props.id)
			}
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
		return (
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
			</div>
		)
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