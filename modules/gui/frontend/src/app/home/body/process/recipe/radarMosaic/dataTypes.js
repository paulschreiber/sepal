import React from 'react'

const typeFloat = {precision: 'float'}

export const dataTypes = () => ({
    VV: typeFloat,
    VV_min: typeFloat,
    VV_mean: typeFloat,
    VV_median: typeFloat,
    VV_max: typeFloat,
    VV_stdDev: typeFloat,
    VV_CV: typeFloat,
    VV_fitted: typeFloat,
    VV_residuals: typeFloat,
    VV_t: typeFloat,
    VV_phase: typeFloat,
    VV_amplitude: typeFloat,
    VH: typeFloat,
    VH_min: typeFloat,
    VH_mean: typeFloat,
    VH_median: typeFloat,
    VH_max: typeFloat,
    VH_stdDev: typeFloat,
    VH_fitted: typeFloat,
    VH_residuals: typeFloat,
    VH_t: typeFloat,
    VH_phase: typeFloat,
    VH_amplitude: typeFloat,
    VH_CV: typeFloat,
    ratio_VV_median_VH_median: typeFloat,
    NDCV: typeFloat,
    ratio_VV_VH: typeFloat,
    constant: typeFloat,
    dayOfYear: {precision: 'int', min: 0, max: 366},
    daysFromTarget: {precision: 'int', min: 0, max: 183},
})
