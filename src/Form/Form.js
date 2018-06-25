import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { formClass } from '../styles'
import { getProps, defaultProps } from '../utils/proptypes'

class Form extends PureComponent {
  constructor(props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleReset = this.handleReset.bind(this)

    this.locked = false
  }

  handleSubmit(e) {
    e.preventDefault()
    if (this.validating || this.locked) return
    this.validating = true

    // prevent duplicate submit
    this.locked = true
    setTimeout(() => {
      this.locked = false
    }, this.props.throttle)

    const { datum, onError, onSubmit } = this.props
    datum.validate().then(() => {
      this.validating = false
      if (onSubmit) onSubmit(datum.getValue())
    }).catch((err) => {
      this.validating = false
      if (onError) onError(err)
    })
  }

  handleReset() {
    const { datum, onReset } = this.props
    datum.reset()
    if (onReset) onReset()
  }

  render() {
    const {
      layout, style, inline, labelAlign, disabled, datum, rules,
    } = this.props

    if (datum && rules && datum.rules !== rules) {
      datum.rules = rules
    }

    const className = classnames(
      formClass(
        '_',
        layout,
        disabled && 'disabled',
        inline && 'inline',
        ['top', 'right'].indexOf(labelAlign) >= 0 && `label-align-${labelAlign}`,
      ),
      this.props.className,
    )

    return (
      <form
        className={className}
        style={style}
        onReset={this.handleReset}
        onSubmit={this.handleSubmit}
      >
        {this.props.children}
      </form>
    )
  }
}

Form.propTypes = {
  ...getProps(PropTypes, 'disabled'),
  datum: PropTypes.object,
  disabled: PropTypes.bool,
  inline: PropTypes.bool,
  labelAlign: PropTypes.string,
  layout: PropTypes.string,
  onError: PropTypes.func,
  onReset: PropTypes.func,
  onSubmit: PropTypes.func,
  rules: PropTypes.object,
  throttle: PropTypes.number,
}

Form.defaultProps = {
  ...defaultProps,
  throttle: 1000,
}

export default Form
