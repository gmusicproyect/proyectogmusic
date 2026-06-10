export function shouldAcceptCheckoutSubmission(
  processing: boolean,
  submitting: boolean
): boolean {
  return !processing && !submitting;
}
