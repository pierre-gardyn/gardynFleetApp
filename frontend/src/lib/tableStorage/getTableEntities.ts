import { TableService, TableQuery } from 'azure-storage';
import { TableStorageEntityProcessor, TableStorageRecord } from './types';

// export interface TableEntity {
//   rowKey: string;
//   timeStamp: string;
//   props: Record<string, string>;
// }

type RunPageQueryCallback = (err: Error | null) => void;

const PROPS_TO_IGNORE = ['PartitionKey', 'RowKey', 'Timestamp'];

function runPageQuery(
  tableService: TableService,
  tableName: string,
  tableQuery: TableQuery,
  withContinuation: boolean,
  continuationToken: TableService.TableContinuationToken | null,
  props: string[],
  entities: TableStorageRecord[],
  nbItems: number,
  entityProcessor: TableStorageEntityProcessor | null,
  callback: RunPageQueryCallback,
) {
  let doContinue = true;
  tableService.queryEntities(
    tableName,
    tableQuery,
    continuationToken as TableService.TableContinuationToken,
    function (error, result) {
      if (error) return callback(error);
      const entries = result.entries;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entries.forEach(function (entity: any) {
        const e: TableStorageRecord = {
          rowKey: entity.RowKey._,
          partitionKey: entity.PartitionKey._,
          timeStamp: entity.Timestamp._,
          props: {},
        };
        if (props && props.length > 0) {
          props.forEach((p) => {
            const prop = entity[p] && entity[p]._;
            if (prop === null || prop === undefined) {
              e.props[p] = '';
            } else if (prop === true || prop === false) {
              e.props[p] = prop ? 'true' : 'false';
            } else {
              e.props[p] = prop;
            }
          });
        } else {
          // we take all the properties
          for (const k in entity) {
            // const k: string
            if (!PROPS_TO_IGNORE.includes(k)) {
              const prop = entity[k] && entity[k]._;
              e.props[k] = prop;
            }
          }
        }
        if (entityProcessor != null) {
          const res = entityProcessor(e);
          if (!res) {
            doContinue = false;
          }
        } else {
          // we store the entities only if there is no processor provided
          entities.push(e);
        }
      });

      // check if we already have all the items we need
      if (!doContinue || (nbItems > 0 && entities.length >= nbItems)) {
        return callback(null);
      } else {
        const hasContinuationToken = !!result.continuationToken;
        if (hasContinuationToken && withContinuation) {
          runPageQuery(
            tableService,
            tableName,
            tableQuery,
            withContinuation,
            result.continuationToken as TableService.TableContinuationToken,
            props,
            entities,
            nbItems,
            entityProcessor,
            callback,
          );
        } else {
          return callback(null);
        }
      }
    },
  );
}

export default async function getTableEntities(
  tableService: TableService,
  tableName: string,
  tableQuery: TableQuery,
  props: string[],
  withContinuation: boolean,
  nbItems: number,
  entityProcessor: TableStorageEntityProcessor | null,
): Promise<TableStorageRecord[]> {
  return new Promise((resolve, reject) => {
    const entities: TableStorageRecord[] = [];
    runPageQuery(
      tableService,
      tableName,
      tableQuery,
      withContinuation,
      null,
      props,
      entities,
      nbItems,
      entityProcessor,
      (err) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        return resolve(entities);
      },
    );
  });
}
