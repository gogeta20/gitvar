type DataSourceMode = "api" | "mock";

const allowedModes: DataSourceMode[] = ["api", "mock"];

function resolveDataSourceMode(rawValue: string | undefined): DataSourceMode {
  if (rawValue && allowedModes.includes(rawValue as DataSourceMode)) {
    return rawValue as DataSourceMode;
  }

  return "mock";
}

export const env = {
  dataSource: resolveDataSourceMode(import.meta.env.VITE_DATA_SOURCE)
};

