export type TaskName = "fonts" | "background" | "viewer" | "copy" | "render";

interface Task {
  weight: number;
  done: number;
  loaded?: number;
  total?: number;
}

const tasks: Record<TaskName, Task> = {
  fonts: { weight: 40, done: 0 },
  background: { weight: 20, done: 0 },
  viewer: { weight: 480, done: 0 },
  copy: { weight: 200, done: 0 },
  render: { weight: 40, done: 0 },
};

const listeners = new Set<() => void>();

export function report(name: TaskName, done: number, bytes?: { loaded: number; total: number }): void {
  const task = tasks[name];

  task.done = Math.max(task.done, Math.min(1, done));

  if (bytes) {
    Object.assign(task, bytes);
    if (bytes.total) task.weight = Math.max(20, bytes.total / 1024);
  }

  listeners.forEach((listen) => listen());
}

export function progress(): number {
  const all = Object.values(tasks);
  const weight = all.reduce((sum, task) => sum + task.weight, 0);

  return all.reduce((sum, task) => sum + task.weight * task.done, 0) / weight;
}

export function current(): { name: TaskName; loaded?: number; total?: number } | null {
  const order: TaskName[] = ["fonts", "background", "viewer", "copy", "render"];
  const name = order.find((key) => tasks[key].done < 1);

  return name ? { name, loaded: tasks[name].loaded, total: tasks[name].total } : null;
}

export function onProgress(listen: () => void): void {
  listeners.add(listen);
}
