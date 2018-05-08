import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Year from './Year'
import Month from './Month'
import Day from './Day'
import Time from './Time'

class Picker extends PureComponent {
  constructor(props) {
    super(props)

    let mode
    switch (props.type) {
      case 'month':
        mode = 'month'
        break
      case 'time':
        mode = 'time'
        break
      default:
        mode = 'day'
    }

    this.state = { mode }

    this.handleChange = this.handleChange.bind(this)
    this.handleModeChange = this.handleModeChange.bind(this)
  }

  handleChange(current, change, end) {
    this.props.onChange(current, change, end)
  }

  handleModeChange(mode) {
    this.setState({ mode })
  }

  /*
  resetCurrent() {
    this.setState({ current: this.props.value || new Date() })
  }
  */

  render() {
    const { mode } = this.state

    let Render
    switch (mode) {
      case 'year':
        Render = Year
        break
      case 'month':
        Render = Month
        break
      case 'time':
        Render = Time
        break
      default:
        Render = Day
    }

    return (
      <Render
        {...this.props}
        onChange={this.handleChange}
        onModeChange={this.handleModeChange}
      />
    )
  }
}

Picker.propTypes = {
  current: PropTypes.object,
  disabled: PropTypes.func,
  format: PropTypes.string,
  max: PropTypes.object,
  min: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object,
  type: PropTypes.string.isRequired,
}

Picker.defaultProps = {
  current: new Date(),
}

export default Picker
