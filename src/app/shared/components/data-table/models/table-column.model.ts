export interface TableColumn<T> {
  info?: string;
  key: Extract<keyof T, string>;
  header: string;
  width?: string;
}
