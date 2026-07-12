import { WorkingChangesWriter } from "@modules/graph/application/contracts/WorkingChangesWriter";
import {
  discardFileFromApi,
  discardHunkFromApi,
  stageFileFromApi,
  stageHunkFromApi,
  unstageFileFromApi,
  unstageHunkFromApi
} from "@modules/graph/infrastructure/sources/workingChanges.api";

export function createWorkingChangesWriter(): WorkingChangesWriter {
  return {
    stageFile: stageFileFromApi,
    unstageFile: unstageFileFromApi,
    discardFile: discardFileFromApi,
    stageHunk: stageHunkFromApi,
    discardHunk: discardHunkFromApi,
    unstageHunk: unstageHunkFromApi
  };
}
