//import React, { ChangeEvent } from 'react';
import React from 'react';
//import { InlineField, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  /*const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, queryText: event.target.value });
  };

  const onConstantChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, constant: parseFloat(event.target.value) });
    console.log("Query is: " + JSON.stringify(query));
    // executes the query
    onRunQuery();
  };*/

  //const { queryText, constant } = query;

  return (
    <div className="gf-form">
        <p>
            Nothing configurable here, yet!
        </p>
        {/*<InlineField label="Constant">
        <Input onChange={onConstantChange} value={constant} width={8} type="number" step="0.1" />
      </InlineField>
      <InlineField label="Query Text" labelWidth={16} tooltip="Not used yet">
        <Input onChange={onQueryTextChange} value={queryText || ''} />
      </InlineField>*/}
    </div>
  );
}