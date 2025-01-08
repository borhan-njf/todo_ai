export const onEnterPress = (
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  callback: (event: React.FormEvent<HTMLFormElement>) => void
) => {
  if (e.key === "Enter" && !e.shiftKey)
    callback(e as unknown as React.FormEvent<HTMLFormElement>);
};

export function parseTasks(content: string): string[] {
  const lines = content.split("\n"); // تقسیم متن به خطوط
  const tasks: string[] = [];

  for (const line of lines) {
    const regex = /^\d+\.\s*(.*)$/; // الگوی regex برای شناسایی خطوط لیست
    const match = line.match(regex);
    if (match) {
      tasks.push(match[1].trim()); // اضافه کردن کار به لیست
    }
  }
  return tasks;
}
