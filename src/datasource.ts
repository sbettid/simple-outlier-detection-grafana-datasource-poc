import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
  DataQuery
} from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { MyDataSourceOptions } from './types';
import { IsolationForest } from 'isolation-forest'

type Point = {time: number, value: number};

export class DataSource extends DataSourceApi<DataQuery, MyDataSourceOptions> {

  webserverURL: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.webserverURL = instanceSettings.jsonData.webserver_url;
  }

  async query(options: DataQueryRequest<DataQuery>): Promise<DataQueryResponse> {
    // Extract the time range
    const {range} = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    // Map each query to a requests
    const promises = options.targets.map((query) =>
        this.doRequest(query, from, to).then((response) => {
          // Create result data frame
          const frame = new MutableDataFrame({
            refId: query.refId,
            fields: [
              {name: "Time", type: FieldType.time},
              {name: "Value", type: FieldType.number},
              {name: "Outlier", type: FieldType.boolean },
            ],
          });

          // Let's store the original points returned by the data source
          let full_points: Point[] = [];

          response.data.query_response.forEach((point: any) => {
            full_points.push({time: point[0], value: point[1]});
          });

          // Get the labels, one for each point
          const outlierLabels = this.getOutlierLabels(full_points);

          // Store the points and labels in the resulting data frame
          for (let i = 0; i  < full_points.length;  i++) {
            frame.appendRow([full_points[i].time, full_points[i].value, outlierLabels[i]]);
          }
          // Return it!
          return frame;
        })
    );
    return Promise.all(promises).then((data) => ({ data }));
  }

  async doRequest(query: DataQuery, from: number, to: number) {
    // Create the request params
    const request_params = {
      method: "GET",
      url: this.webserverURL + "/query",
      params: {"from": from, "to": to},
    };
    // Perform the request
    const result = await getBackendSrv().datasourceRequest(request_params);

    return result;
  }

  getOutlierLabels(full_points: Point[]) {

    // Create the Isolation Forest object
    const isolation_forest = new IsolationForest();

    // Feed it with our points
    isolation_forest.fit(full_points);

    // Get back the anomaly scores
    const scores = isolation_forest.scores();

    // Let's store the true/false labels
    let outlier_labels = [];

    // Where a point is considered as anomaly if
    // the anomaly score > 0.6
    for (const score of scores) {
      if (score > 0.6) {
        outlier_labels.push(true);
      } else {
        outlier_labels.push(false);
      }
    }
    // Return the labels
    return outlier_labels;
  }

  async testDatasource() {

    const request_params = {
      method: "GET",
      url: this.webserverURL,
    };
    const result = await getBackendSrv().datasourceRequest(request_params)

    let status = "failed";
    let message = "";

    if (result.ok) {
      status = "success";
      message = result.data;
    }

    return {
      status: status,
      message: message,
    };
  }
}
