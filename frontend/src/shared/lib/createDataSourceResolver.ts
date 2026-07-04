import { env } from "@shared/config/env";

type SourceHandlers<TArgs extends unknown[], TResult> = {
  api: (...args: TArgs) => Promise<TResult>;
  mock: (...args: TArgs) => Promise<TResult>;
};

export function createDataSourceResolver<TArgs extends unknown[], TResult>(
  handlers: SourceHandlers<TArgs, TResult>
) {
  return async (...args: TArgs): Promise<TResult> => {
    if (env.dataSource === "api") {
      return handlers.api(...args);
    }

    return handlers.mock(...args);
  };
}

