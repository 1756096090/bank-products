export interface TableAction<T> {
  label: string;
  icon?: string;
  src?: string;
  width?: string;
  execute: (row: T) => void;
}