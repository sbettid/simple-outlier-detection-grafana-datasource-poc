import React, {ChangeEvent, PureComponent} from 'react';
import { LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions } from '../types';
const { FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  onWebserverURLChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      webserver_url: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  render() {
    const { options } = this.props;
    const { jsonData } = options;

    return (
        <div className="gf-form-group">
          <div className="gf-form">
            <FormField
                label="Webserver URL"
                labelWidth={15}
                inputWidth={20}
                onChange={this.onWebserverURLChange}
                value={jsonData.webserver_url || ''}
                placeholder="The URL of your webserver"
                required={true}
            />
          </div>
        </div>
    );
  }
}
