export class InvalidError extends Error {
  label: string

  constructor(message: string, label: string) {
    super(message)
    this.label = label
    this.name = "InvalidError"
  }
}
