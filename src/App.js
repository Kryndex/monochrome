
const React = require('react')
const chroma = require('chroma-js')
const throttle = require('lodash/throttle')
const Main = require('./Main')
const Luminances = require('./Luminances')
const Footer = require('./Footer')
const rebassConfig = require('./rebass-config')
const createPalette = require('./palette')

const { toHex, toHsl, isDark } = require('./utils')

class App extends React.Component {
  constructor ({ color }) {
    super()
    color = color && color.length ? color : '007ce0'
    const [ h, s, l ] = chroma(color).hsl()
    this.state = {
      h: h || 0,
      s,
      l,
      hex: '#' + color
    }
    this.handleHexChange = this.handleHexChange.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.updateUrl = throttle(this.updateUrl.bind(this), 500)
  }

  getChildContext () {
    return {
      rebass: rebassConfig
    }
  }

  handleHexChange (hex) {
    const hsl = toHsl(hex)
    if (!hsl) {
      this.setState({ hex })
      return
    }

    const [ h, s, l ] = hsl

    this.setState({ hex, h, s, l }, () => {
      this.updateUrl()
    })
  }

  handleChange (e) {
    const { name, value } = e.target
    const num = parseFloat(value)
    const val = isNaN(num) ? value : num
    this.setState({ [name]: val }, () => {
      const { h, s, l } = this.state
      const hex = toHex([ h, s, l ])
      this.setState({ hex }, () => {
        this.updateUrl()
      })
    })
  }

  updateUrl () {
    const path = this.state.hex.replace(/^#/, '')
    history.pushState(this.state, path, '/' + path)
  }

  render () {
    const { color } = this.props
    const { h, s, l } = this.state

    const hex = toHex([ h, s, l ])
    const dark = isDark(hex)

    const palette = createPalette({ h, s, l })

    const css = `::selection{background-color:${dark ? '#000' : '#fff'}}`

    const sx = {
      root: {
        color: dark ? '#fff' : '#000',
        backgroundColor: hex,
        transition: 'color .4s ease-out'
      }
    }

    return (
      <div style={sx.root}>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <Main
          {...this.state}
          value={hex}
          onChange={this.handleChange}
          onHexChange={this.handleHexChange}
        />
        <Luminances
          {...this.state}
          steps={palette.shades}
        />
        <Footer color={hex.replace(/^#/, '')} />
      </div>
    )
  }
}

App.childContextTypes = {
  rebass: React.PropTypes.object
}

module.exports = App

