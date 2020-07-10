import {Button} from 'widget/button'
import {msg} from 'translate'
import Confirm from 'widget/confirm'
import PropTypes from 'prop-types'
import React from 'react'

export default class SafetyButton extends React.Component {
    state = {
        askConfirmation: false
    }

    askConfirmation(askConfirmation) {
        this.setState({askConfirmation})
    }

    renderConfirm() {
        const {title, message, confirmLabel, onConfirm, children} = this.props
        return (
            <Confirm
                title={title}
                message={message}
                label={confirmLabel || msg('widget.safetyButton.label')}
                onConfirm={() => {
                    this.askConfirmation(false)
                    onConfirm()
                }}
                onCancel={() => this.askConfirmation(false)}>
                {children}
            </Confirm>
        )
    }

    render() {
        const {skipConfirmation, onConfirm, onClick, onClickHold, ...otherProps} = this.props
        const {askConfirmation} = this.state
        return (
            <React.Fragment>
                <Button
                    onClick={() => skipConfirmation ? onConfirm() : this.askConfirmation(true)}
                    onClickHold={() => onConfirm()}
                    {...otherProps}
                />
                {askConfirmation ? this.renderConfirm() : null}
            </React.Fragment>
        )
    }
}

SafetyButton.propTypes = {
    message: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    confirmLabel: PropTypes.string,
    title: PropTypes.string,
    skipConfirmation: PropTypes.bool
}
