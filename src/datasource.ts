import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { MyQuery, MyDataSourceOptions } from './types';
import { IsolationForest } from 'isolation-forest'

type Point = {time: number, value: number};

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {

  webserverURL: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.webserverURL = instanceSettings.jsonData.webserver_url;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const {range} = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    const promises = options.targets.map((query) =>
        this.doRequest(query, from, to).then((response) => {
          const frame = new MutableDataFrame({
            refId: query.refId,
            fields: [
              {name: "Time", type: FieldType.time},
              {name: "Value", type: FieldType.number},
              {name: "Outlier", type: FieldType.boolean },
            ],
          });

          console.log(response)

          let full_points: Point[] = [];

          response.data.query_response.forEach((point: any) => {
            full_points.push({time: point[0], value: point[1]});
          });

          const labels = this.getLabels(full_points);

          for (let i = 0; i  < full_points.length;  i++) {
            frame.appendRow([full_points[i].time, full_points[i].value, labels[i]]);
          }
          console.log(JSON.stringify(frame))
          return frame;
        })
    );
    return Promise.all(promises).then((data) => ({ data }));
  }

  async doRequest(query: MyQuery, from: number, to: number) {
    const request_params = {
      method: "GET",
      url: this.webserverURL + "/query",
      params: {"from": from, "to": to},
    };
    const result = await getBackendSrv().datasourceRequest(request_params);

    return result;
  }



  getLabels(full_points: Point[]) {

    console.log("Full pointd: " + full_points);

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
