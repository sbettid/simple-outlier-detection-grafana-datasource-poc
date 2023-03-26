import React from 'react';
import { QueryEditorProps, DataQuery } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions } from '../types';

type Props = QueryEditorProps<DataSource, DataQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {

  return (
    <div className="gf-form">
        <p>
            Nothing configurable here, yet!
        </p>
    </div>
  );
}
