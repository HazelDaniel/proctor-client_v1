export class ConstraintAssertion {
  static construct(fns: (() => boolean)[], message: string) {
    const wrongAssertions = fns.map((e) => e()).some((value) => !value);

    if (wrongAssertions) {
      throw new Error(message);
    }
  }
}