const QUICK_COMMANDS_KEY = 'notyai_quick_commands';

export function readQuickCommands(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(QUICK_COMMANDS_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  } catch {
    return [];
  }
}

export function saveQuickCommands(commands: string[]): void {
  localStorage.setItem(QUICK_COMMANDS_KEY, JSON.stringify(commands));
}
