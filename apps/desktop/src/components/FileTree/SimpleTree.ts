import { getFileObject, pathEntries } from '@/helper/files'

type SimpleData = { id: string; name: string; children?: SimpleData[] }

export class SimpleTree<T extends SimpleData> {
  root: SimpleNode<T>
  constructor(data: T[]) {
    this.root = createRoot<T>(data)
  }

  get data() {
    return this.root.children?.map((node) => node.data) ?? []
  }

  create(args: { parentId: string | null; index?: number | null; data: T }) {
    const parent = args.parentId ? this.find(args.parentId) : this.root
    if (!parent) return null
    parent.addChild(args.data, args.index)
  }

  move(args: { id: string; parentId: string | null; index: number }) {
    const src = this.find(args.id)
    const parent = args.parentId ? this.find(args.parentId) : this.root
    if (!src || !parent) return
        parent.addChild(src.data, args.index)
    src.drop()
  }

  update(args: { id: string; changes: Partial<T> }) {
    const node = this.find(args.id)
    if (node) node.update(args.changes)
  }

  drop(args: { id: string }) {
    const node = this.find(args.id)
    const file = getFileObject(args.id)
    if (node) node.drop()
    if (file?.path) delete pathEntries[file.path]
  }

  find(id: string, node: SimpleNode<T> = this.root): SimpleNode<T> | null {
    if (!node) return null
    if (node.id === id) return node as SimpleNode<T>
    if (node.children) {
      for (let child of node.children) {
        const found = this.find(id, child)
        if (found) return found
      }
      return null
    }
    return null
  }
}

function createRoot<T extends SimpleData>(data: T[]) {
  const root = new SimpleNode<T>({ id: 'ROOT' } as T, null)
  root.children = data.map((d) => createNode(d as T, root))
  return root
}

function createNode<T extends SimpleData>(data: T, parent: SimpleNode<T>) {
  const node = new SimpleNode<T>(data, parent)
  if (data.children) node.children = data.children.map((d) => createNode<T>(d as T, node))
  return node
}

class SimpleNode<T extends SimpleData> {
  id: string
  children?: SimpleNode<T>[]
  constructor(
    public data: T,
    public parent: SimpleNode<T> | null,
  ) {
    this.id = data.id
  }

  hasParent(): this is this & { parent: SimpleNode<T> } {
    return !!this.parent
  }

  get childIndex(): number {
    return this.hasParent() ? this.parent.children!.indexOf(this) : -1
  }

  addChild(data: T, index?: number | null) {
    const node = createNode(data, this)
    this.children = this.children ?? []
    if (index === undefined || index === null) {
      index = this.children.findIndex((child) => !Array.isArray(child.children)) || 0
    }
    this.children.splice(index, 0, node)
    this.data.children = this.data.children ?? []
    this.data.children.splice(index, 0, data)
  }

  removeChild(index: number) {
    this.children?.splice(index, 1)
    this.data.children?.splice(index, 1)
  }

  cleanChildren() {
    this.children = []
    this.data.children = []
  }

  update(changes: Partial<T>) {
    if (this.hasParent()) {
      const i = this.childIndex
      this.parent.addChild({ ...this.data, ...changes }, i)
      this.drop()
    }
  }

  drop() {
    if (this.hasParent()) this.parent.removeChild(this.childIndex)
  }
}
