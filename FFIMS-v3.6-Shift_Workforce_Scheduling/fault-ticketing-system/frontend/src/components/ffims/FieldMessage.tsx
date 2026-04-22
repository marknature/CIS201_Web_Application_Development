export function FieldMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-[12px] font-medium text-destructive">{message}</p>;
}
