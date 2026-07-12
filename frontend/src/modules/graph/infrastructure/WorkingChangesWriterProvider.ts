import { WorkingChangesWriter } from "@modules/graph/application/contracts/WorkingChangesWriter";
import {
  discardFileFromApi,
  stageFileFromApi,
  unstageFileFromApi
} from "@modules/graph/infrastructure/sources/workingChanges.api";

export function createWorkingChangesWriter(): WorkingChangesWriter {
  return {
    stageFile: stageFileFromApi,
    unstageFile: unstageFileFromApi,
    discardFile: discardFileFromApi
  };
}
