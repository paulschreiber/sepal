package org.openforis.sepal.component.datasearch.metadata

import org.openforis.sepal.component.dataprovider.DataSet
import org.openforis.sepal.component.datasearch.metadata.crawling.MetadataCrawlingCriteria
import org.openforis.sepal.util.annotation.Data

@Data
class MetadataProvider {

    int id
    String name
    Boolean active
    String entrypoint
    int iterations
    int iterationSize
    Date lastStartTime
    Date lastEndTime
    Set<DataSet> dataSets
    Set<MetadataCrawlingCriteria> crawlingCriterias

    MetadataProvider() {
        dataSets = new HashSet<DataSet>()
        crawlingCriterias = new HashSet<DataSet>()
    }

}
