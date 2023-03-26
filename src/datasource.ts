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
import {  MyDataSourceOptions } from './types';
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
            ],
          });
          // for each element of the query response add a row in the result data frame
          response.data.query_response.forEach((point: any) => {
            frame.appendRow([point[0], point[1]]);
          });
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



  getLabels(full_points: Point[]) {

    const isolation_forest = new IsolationForest();
    isolation_forest.fit(full_points);

    const scores = isolation_forest.scores();

    let isolation_labels = [];

    for (const score of scores) {
      if (score > 0.6) {
        isolation_labels.push(true);
      } else {
        isolation_labels.push(false);
      }
    }
    return isolation_labels;
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
