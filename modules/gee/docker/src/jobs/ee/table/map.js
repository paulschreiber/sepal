const {job} = require('root/jobs/job')

const worker$ = ({tableId, columnName, columnValue, buffer, color = '#FFFFFF50', fillColor = '#FFFFFF08'}) => {
    const ee = require('ee')
    const {filterTable} = require('sepal/ee/table')
    const {forkJoin} = require('rx')
    const {map} = require('rx/operators')
    const _ = require('lodash')

    const log = require('sepal/log').getLogger('ee')
    log.fatal(fillColor)

    const bufferMeters = (buffer && _.toNumber(buffer)) * 1000
    const table = bufferMeters
        ? filterTable({tableId, columnName, columnValue})
            .map(feature => feature.buffer(ee.Number(bufferMeters), bufferMeters / 10))
        : filterTable({tableId, columnName, columnValue})
    const bounds = bufferMeters
        ? table.geometry().bounds(bufferMeters / 10).buffer(ee.Number(bufferMeters), bufferMeters / 10).bounds(bufferMeters / 10)
        : table.geometry().bounds()
    const boundsPolygon = ee.List(bounds.coordinates().get(0))
    return forkJoin({
        bounds: ee.getInfo$(ee.List([boundsPolygon.get(0), boundsPolygon.get(2)]), 'get bounds'),
        eeMap: ee.getMap$(table.style({color, fillColor}))
    }).pipe(
        map(({bounds, eeMap}) => ({bounds, ...eeMap}))
    )
}

module.exports = job({
    jobName: 'Request EE Table map',
    jobPath: __filename,
    args: ctx => [ctx.request.query],
    worker$
})
