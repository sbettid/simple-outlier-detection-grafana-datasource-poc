import { DataSourceJsonData } from '@grafana/data';

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  webserver_url: string;
}
