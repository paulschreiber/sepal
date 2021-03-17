import {Form} from 'widget/form/form'
import {Layout} from 'widget/layout'
import {Subject} from 'rxjs'
import {compose} from 'compose'
import {connect, select} from 'store'
import {countryEETable, setAoiLayer} from 'app/home/map/aoiLayer'
import {map, takeUntil} from 'rxjs/operators'
import {msg} from 'translate'
import {withMapContext} from 'app/home/map/mapContext'
import Notifications from 'widget/notifications'
import PropTypes from 'prop-types'
import React from 'react'
import _ from 'lodash'
import actionBuilder from 'action-builder'
import api from 'api'

const loadCountries$ = () => {
    return api.gee.queryEETable$({
        select: ['id', 'label'],
        from: countryEETable,
        where: [['parent_id', 'equals', '']],
        orderBy: ['label']
    }).pipe(
        map(countries => countries.map(({id, label}) => ({value: id, label}))),
        map(countries =>
            actionBuilder('SET_COUNTRIES', {countries})
                .set('countries', countries)
                .dispatch()
        )
    )
}

const loadCountryForArea$ = areaId => {
    return api.gee.queryEETable$({
        select: ['parent_id'],
        from: countryEETable,
        where: [['id', 'equals', areaId]],
        orderBy: ['label']
    })
}

const loadCountryAreas$ = countryId => {
    return api.gee.queryEETable$({
        select: ['id', 'label'],
        from: countryEETable,
        where: [['parent_id', 'equals', countryId]],
        orderBy: ['label']
    }).pipe(
        map(countries => countries.map(({id, label}) => ({value: id, label}))),
        map(areas =>
            actionBuilder('SET_COUNTRY_AREA', {countryId, areas})
                .set(['areasByCountry', countryId], areas)
                .dispatch()
        )
    )
}

const mapStateToProps = (state, ownProps) => {
    return {
        countries: select('countries'),
        countryAreas: select(['areasByCountry', ownProps.inputs.country.value]),
    }
}

class _CountrySection extends React.Component {
    constructor(props) {
        super(props)
        this.aoiChanged$ = new Subject()
        this.update()
    }

    loadCountryAreas(countryId) {
        if (!select(['areasByCountry', countryId]))
            this.props.stream('LOAD_COUNTRY_AREAS',
                loadCountryAreas$(countryId).pipe(
                    takeUntil(this.aoiChanged$)
                ))
    }

    render() {
        const {stream, countries, countryAreas, inputs: {country, area, buffer}} = this.props
        const loadCountries = stream('LOAD_COUNTRIES')
        const loadCountryAreas = stream('LOAD_COUNTRY_AREAS')
        const countriesState = loadCountries.active
            ? 'loading'
            : 'loaded'
        const areasState = loadCountryAreas.active
            ? 'loading'
            : country.value
                ? countryAreas && countryAreas.length > 0 ? 'loaded' : 'noAreas'
                : 'noCountry'
        const countryPlaceholder = msg(`process.mosaic.panel.areaOfInterest.form.country.country.placeholder.${countriesState}`)
        const areaPlaceholder = msg(`process.mosaic.panel.areaOfInterest.form.country.area.placeholder.${areasState}`)
        return (
            <Layout>
                <Form.Combo
                    label={msg('process.mosaic.panel.areaOfInterest.form.country.country.label')}
                    input={country}
                    placement='below'
                    options={countries || []}
                    placeholder={countryPlaceholder}
                    busyMessage={loadCountries.active && msg('widget.loading')}
                    disabled={loadCountries.failed}
                    autoFocus
                    onChange={option => {
                        area.set('')
                        this.aoiChanged$.next()
                        this.loadCountryAreas(option.value)
                    }}
                />
                <Form.Combo
                    label={msg('process.mosaic.panel.areaOfInterest.form.country.area.label')}
                    input={area}
                    placement='below'
                    options={(countryAreas || [])}
                    placeholder={areaPlaceholder}
                    busyMessage={loadCountryAreas.active && msg('widget.loading')}
                    disabled={loadCountryAreas.failed || !countryAreas || countryAreas.length === 0}
                    onChange={() => this.aoiChanged$.next()}
                    allowClear
                />
                <Form.Slider
                    label={msg('process.mosaic.panel.areaOfInterest.form.buffer.label')}
                    tooltip={msg('process.mosaic.panel.areaOfInterest.form.buffer.tooltip')}
                    info={buffer => msg('process.mosaic.panel.areaOfInterest.form.buffer.info', {buffer})}
                    input={buffer}
                    minValue={0}
                    maxValue={100}
                    scale={'log'}
                    ticks={[0, 1, 2, 5, 10, 20, 50, 100]}
                    snap
                    range='none'
                />
            </Layout>
        )
    }

    componentDidMount() {
        const {stream, inputs: {country, area}} = this.props
        if (area.value && !country.value)
            stream('LOAD_COUNTRY_FOR_AREA',
                loadCountryForArea$(area.value).pipe(
                    map(countryId => {
                        country.setInitialValue(countryId)
                        this.loadCountryAreas(countryId)
                    })
                ))
        this.update()
        if (country.value)
            this.loadCountryAreas(country.value)
    }

    componentDidUpdate(prevProps) {
        if (!prevProps || prevProps.inputs !== this.props.inputs)
            this.update(prevProps)
    }

    update() {
        const {sepalMap, countries, stream, inputs: {country, area, buffer}, layerIndex} = this.props
        if (!countries && !stream('LOAD_COUNTRIES').active && !stream('LOAD_COUNTRIES').failed) {
            this.props.stream('LOAD_COUNTRIES',
                loadCountries$(),
                null,
                () => Notifications.error({
                    message: msg('process.mosaic.panel.areaOfInterest.form.country.country.loadFailed'),
                    timeout: 10
                })
            )
        }
        setAoiLayer({
            sepalMap,
            aoi: {
                type: 'COUNTRY',
                countryCode: country.value,
                areaCode: area.value,
                buffer: buffer.value
            },
            // destroy$: componentWillUnmount$,
            onInitialized: () => sepalMap.fitLayer('aoi'),
            layerIndex
        })
        if (!_.isFinite(buffer.value)) {
            buffer.set(0)
        }
    }
}

export const CountrySection = compose(
    _CountrySection,
    connect(mapStateToProps),
    withMapContext()
)

CountrySection.propTypes = {
    inputs: PropTypes.object.isRequired,
    recipeId: PropTypes.string.isRequired,
    layerIndex: PropTypes.number
}
