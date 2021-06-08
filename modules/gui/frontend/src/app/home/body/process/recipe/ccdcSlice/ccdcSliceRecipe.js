import {msg} from 'translate'
import {recipeActionBuilder} from '../../recipe'
import {selectFrom} from 'stateUtils'
import _ from 'lodash'
import api from 'api'

export const defaultModel = {
    date: {
    },
    source: {},
    options: {
        harmonics: 3,
        gapStrategy: 'INTERPOLATE',
        extrapolateSegment: 'CLOSEST',
        extrapolateMaxDays: 30
    }
}

export const RecipeActions = id => {
    const actionBuilder = recipeActionBuilder(id)

    return {
        setBands(selection, baseBands) {
            return actionBuilder('SET_BANDS', {selection, baseBands})
                .set('ui.bands.selection', selection)
                .set('ui.bands.baseBands', baseBands)
                .dispatch()
        },
        setChartPixel(latLng) {
            return actionBuilder('SET_CHART_PIXEL', latLng)
                .set('ui.chartPixel', latLng)
                .dispatch()
        },
        retrieve(retrieveOptions) {
            return actionBuilder('REQUEST_CCDC_SLICE_RETRIEVAL', {retrieveOptions})
                .setAll({
                    'ui.retrieveState': 'SUBMITTED',
                    'ui.retrieveOptions': retrieveOptions
                })
                .sideEffect(recipe => submitRetrieveRecipeTask(recipe))
                .build()
        }
    }
}

export const loadCCDCSegments$ = ({recipe, latLng, bands}) =>
    api.gee.loadCCDCSegments$({recipe: recipe.model.source, latLng, bands})

export const getAllVisualizations = recipe => {
    return [
        ...Object.values((selectFrom(recipe, ['layers.userDefinedVisualizations', 'this-recipe']) || {})),
        ...selectFrom(recipe, 'model.source.visualizations') || []
    ]
}

const submitRetrieveRecipeTask = recipe => {
    const name = recipe.title || recipe.placeholder
    const scale = recipe.ui.retrieveOptions.scale
    const destination = recipe.ui.retrieveOptions.destination
    const taskTitle = msg(['process.ccdcSlice.panel.retrieve.task', destination], {name})
    const {baseBands, bandTypes, segmentBands} = recipe.ui.retrieveOptions
    const bandTypeSuffixes = {
        value: '',
        rmse: '_rmse',
        magnitude: '_magnitude',
        intercept: '_intercept',
        slope: '_slope',
        phase_1: '_phase_1',
        phase_2: '_phase_2',
        phase_3: '_phase_3',
        amplitude_1: '_amplitude_1',
        amplitude_2: '_amplitude_2',
        amplitude_3: '_amplitude_3',
    }
    const allBands = [
        ...recipe.model.source.bands,
        ...recipe.model.source.baseBands.map(({name}) => name)
    ]
    const bands = [
        ...baseBands
            .map(baseBand => bandTypes.map(bandType => `${baseBand}${bandTypeSuffixes[bandType]}`))
            .flat(),
        ...baseBands.map(({name}) => name),
        ...segmentBands
    ].filter(band => allBands.includes(band))
    const task = {
        'operation': `image.${destination === 'SEPAL' ? 'sepal_export' : 'asset_export'}`,
        'params':
            {
                title: taskTitle,
                description: name,
                image: {
                    recipe: _.omit(recipe, ['ui']),
                    bands: {selection: bands, baseBands},
                    visualizations: getAllVisualizations(recipe),
                    scale
                }
            }
    }
    return api.tasks.submit$(task).subscribe()
}
