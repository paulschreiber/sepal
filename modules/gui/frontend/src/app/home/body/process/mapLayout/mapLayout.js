import {AddImageLayerSource} from './addImageLayerSource'
import {Areas} from './areas'
import {Buttons} from 'widget/buttons'
import {ImageLayerSources} from './imageLayerSources'
import {Panel} from 'widget/panel/panel'
import {SelectRecipe} from './selectRecipe'
import {Subject} from 'rxjs'
import {activatable} from 'widget/activation/activatable'
import {activator} from 'widget/activation/activator'
import {compose} from 'compose'
import {msg} from 'translate'
import {selectFrom} from 'stateUtils'
import {withRecipe} from 'app/home/body/process/recipeContext'
import React from 'react'
import styles from './mapLayout.module.css'

export class MapLayout extends React.Component {
    render() {
        return (
            <React.Fragment>
                <MapLayoutPanel/>
                <AddImageLayerSource/>
                <SelectRecipe/>
            </React.Fragment>
        )
    }
}

const mapRecipeToProps = recipe => ({
    recipe,
    mode: selectFrom(recipe, 'layers.mode')
})

class _MapLayoutPanel extends React.Component {
    sourceDrag$ = new Subject()

    constructor() {
        super()
        this.setMode = this.setMode.bind(this)
    }

    render() {
        const {activatable: {deactivate}} = this.props
        const close = deactivate
        return (
            <Panel
                className={styles.panel}
                type='modal'>
                <Panel.Header
                    icon='layer-group'
                    title={msg('map.layout.title')}
                    label={this.renderModeButtons()}
                />
                <Panel.Content
                    scrollable={false}
                    noVerticalPadding
                    className={styles.panelContent}>
                    {this.renderContent()}
                </Panel.Content>
                <Panel.Buttons onEnter={close} onEscape={close}>
                    <Panel.Buttons.Main>
                        <Panel.Buttons.Close onClick={close}/>
                    </Panel.Buttons.Main>
                    <Panel.Buttons.Extra>
                        <Panel.Buttons.Add onClick={() => this.addImageLayerSource()}/>
                    </Panel.Buttons.Extra>
                </Panel.Buttons>
            </Panel>
        )
    }

    renderModeButtons() {
        const {mode} = this.props
        return (
            <Buttons
                selected={mode}
                options={[
                    {value: 'grid', label: msg('map.layout.mode.grid')},
                    {value: 'stack', label: msg('map.layout.mode.stack')}
                ]}
                onChange={this.setMode}
            />
        )
    }

    renderContent() {
        return (
            <div className={styles.content}>
                <Areas sourceDrag$={this.sourceDrag$}/>
                <ImageLayerSources drag$={this.sourceDrag$}/>
            </div>
        )
    }

    setMode(mode) {
        const {recipeActionBuilder} = this.props
        recipeActionBuilder('SET_SPLIT_MODE')
            .set('layers.mode', mode)
            .dispatch()
    }

    addImageLayerSource() {
        const {activator: {activatables: {addImageLayerSource}}} = this.props
        addImageLayerSource.activate()
    }
}

const policy = () => ({
    _: 'allow'
})

export const MapLayoutPanel = compose(
    _MapLayoutPanel,
    withRecipe(mapRecipeToProps),
    activatable({id: 'mapLayout', policy}),
    activator('addImageLayerSource')
)

MapLayout.propTypes = {}
