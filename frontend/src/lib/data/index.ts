export interface ChartPoint {
  label: string;
  value: number;
}

interface TableValue {
  value: string;
  className: string;
}

interface Table {
  tableName: string;
  columnNames: string[];
  rows: TableValue[][];
}

interface Chart {
  id: string;
  type: string;
  title: string;
  labels: string;
  data: string;
  points: ChartPoint[];
}
interface SubSection {
  title: string;
  props: {
    name: string;
    value: string;
  }[];
  tables: Table[];
  notes: string[];
  charts: Chart[];
}

interface Section {
  title: string;
  subSections: SubSection[];
}

type PropType = string | number;
export interface PropxType {
  value: PropType;
  status: 'error' | 'warning' | 'normal';
}

export interface DataFn {
  addSection(title: string): {
    addSubSection(title: string): {
      addProp(name: string, value: PropType): DataSubSectionFn;
      addTable(
        name: string,
        columnNames: string[],
      ): {
        addRow(data: PropType[]): DataTableFn;
        addRowx(data: PropxType[]): DataTableFn;
      };
      addNote(note: string): void;
      addChart(
        name: string,
        type: string,
        points: ChartPoint[],
        title: string,
      ): void;
    };
  };
  content(): Section[];
}

export type DataSectionFn = ReturnType<DataFn['addSection']>;
export type DataSubSectionFn = ReturnType<DataSectionFn['addSubSection']>;
export type DataTableFn = ReturnType<DataSubSectionFn['addTable']>;

export function mkData(): DataFn {
  const sections: Section[] = [];
  return {
    addSection(title: string) {
      const section: Section = {
        title,
        subSections: [],
      };
      sections.push(section);
      return {
        addSubSection(title: string) {
          const subSection: SubSection = {
            title,
            props: [],
            tables: [],
            notes: [],
            charts: [],
          };
          section.subSections.push(subSection);
          return {
            addProp(name: string, value: PropType) {
              subSection.props.push({
                name,
                value: `${value}`,
              });
              return this;
            },
            addTable(name: string, columnNames: string[]) {
              const table: Table = {
                tableName: name,
                columnNames: [...columnNames],
                rows: [],
              };
              subSection.tables.push(table);
              return {
                addRow(data: PropType[]) {
                  table.rows.push(
                    data.map((v) => {
                      return { value: `${v}`, className: '' };
                    }),
                  );
                  return this;
                },
                addRowx(data: PropxType[]) {
                  table.rows.push(
                    data.map((v) => {
                      const value = v.value;
                      let className = '';
                      switch (v.status) {
                        case 'normal':
                          className = '';
                          break;
                        case 'error':
                          className = 'has-background-danger-light';
                          break;
                        case 'warning':
                          className = 'has-background-warning-light';
                          break;
                      }
                      return { value: `${value}`, className };
                    }),
                  );
                  return this;
                },
              };
            },
            addNote(note: string) {
              subSection.notes.push(note);
            },
            addChart(
              id: string,
              type: string,
              points: ChartPoint[],
              title = '',
            ) {
              subSection.charts.push({
                id,
                type,
                title,
                labels: points.map((p) => `"${p.label}"`).join(','),
                data: points.map((p) => p.value).join(','),
                points,
              });
            },
          };
        },
      };
    },
    content() {
      return sections;
    },
  };
}
