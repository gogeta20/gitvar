import { StashEntry } from "@modules/stash/domain/stashEntry";

interface StashEntryDto {
  reference: string;
  index: number;
  commitId: string;
  shortCommitId: string;
  baseCommitId: string;
  relativeDate: string;
  message: string;
}

interface StashResponseDto {
  entries: StashEntryDto[];
}

export function parseStashDto(input: StashResponseDto): StashEntry[] {
  return input.entries.map((entry) => ({
    reference: entry.reference,
    index: entry.index,
    commitId: entry.commitId,
    shortCommitId: entry.shortCommitId,
    baseCommitId: entry.baseCommitId,
    relativeDate: entry.relativeDate,
    message: entry.message
  }));
}
