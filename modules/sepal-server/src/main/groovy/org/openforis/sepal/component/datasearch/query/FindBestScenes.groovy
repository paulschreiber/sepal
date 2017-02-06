package org.openforis.sepal.component.datasearch.query

import org.openforis.sepal.component.datasearch.DataSet
import org.openforis.sepal.component.datasearch.SceneMetaData
import org.openforis.sepal.component.datasearch.SceneMetaDataProvider
import org.openforis.sepal.component.datasearch.api.SceneQuery
import org.openforis.sepal.query.Query
import org.openforis.sepal.query.QueryHandler
import org.openforis.sepal.util.annotation.Data

@Data
class FindBestScenes implements Query<Map<String, List<SceneMetaData>>> {
    DataSet dataSet
    Collection<String> sceneAreaIds
    Collection<String> sensorIds
    Date fromDate
    Date toDate
    int targetDayOfYear
    double targetDayOfYearWeight
    double cloudCoverTarget
    int minScenes = 1
    int maxScenes = Integer.MAX_VALUE
}

class FindBestScenesHandler implements QueryHandler<Map<String, List<SceneMetaData>>, FindBestScenes> {
    private final SceneMetaDataProvider sceneMetaDataProvider

    FindBestScenesHandler(SceneMetaDataProvider sceneMetaDataProvider) {
        this.sceneMetaDataProvider = sceneMetaDataProvider
    }

    Map<String, List<SceneMetaData>> execute(FindBestScenes query) {
        query.sceneAreaIds.collectEntries { sceneAreaId ->
            def scenes = []
            def cloudCover = 1
            sceneMetaDataProvider.eachScene(
                    new SceneQuery(
                            dataSet: query.dataSet,
                            sceneAreaId: sceneAreaId,
                            sensorIds: query.sensorIds,
                            fromDate: query.fromDate,
                            toDate: query.toDate,
                            targetDayOfYear: query.targetDayOfYear),
                    query.targetDayOfYearWeight) { SceneMetaData scene ->
                scenes << scene
                cloudCover *= scene.cloudCover / 100
                if (query.maxScenes <= scenes.size())
                    return false
                return (cloudCover > query.cloudCoverTarget || scenes.size() < query.minScenes)
            }
            [(sceneAreaId): scenes]
        }
    }
}
