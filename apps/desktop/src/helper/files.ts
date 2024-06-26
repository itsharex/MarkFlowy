import type { IFile } from './filesys'

type IEntries = Record<string, IFile>;

export const entries: IEntries = {}
export const pathEntries: IEntries = {}

export function setFileObject(id: string, file: IFile): void {
  entries[id] = file
}

export function getFileObject(id: string): IFile {
  return entries[id]
}

export function updateFileObject(id: string, file: IFile): void {
  entries[id] = file
}

export function setFileObjectByPath(path: string, file: IFile): void {
  pathEntries[path] = file
}

export function getFileObjectByPath(path: string): IFile {
  return pathEntries[path]
}
