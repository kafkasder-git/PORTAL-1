import { clsx, type ClassValue } from "clsx"

// Shorthand to full property mapping
const SHORTHAND_MAP: Record<string, string> = {
  'p': 'padding',
  'pt': 'padding-top',
  'pr': 'padding-right',
  'pb': 'padding-bottom',
  'pl': 'padding-left',
  'px': 'padding-left',
  'py': 'padding-top',
  'm': 'margin',
  'mt': 'margin-top',
  'mr': 'margin-right',
  'mb': 'margin-bottom',
  'ml': 'margin-left',
  'mx': 'margin-left',
  'my': 'margin-top',
}

export function cn(...inputs: ClassValue[]) {
  const classes = clsx(inputs).split(' ').filter(Boolean);

  // Map to track which properties have been set (for conflict detection)
  const propertyMap = new Map<string, string>();

  // Process each class from last to first (so later classes override earlier ones)
  for (let i = classes.length - 1; i >= 0; i--) {
    const cls = classes[i];

    // Extract property and value (e.g., 'p-4' -> property='p', value='4')
    const match = cls.match(/^([a-z-]+)-(.+)$/);
    if (!match) {
      // No dash, might be a modifier or other class
      continue;
    }

    const [, property, value] = match;

    // Normalize property (convert shorthand to full form)
    const normalizedProperty = SHORTHAND_MAP[property] || property;

    // Check if this property conflicts with previously added classes
    if (propertyMap.has(normalizedProperty)) {
      // Remove the old class
      const oldClass = propertyMap.get(normalizedProperty)!;
      const oldIndex = classes.indexOf(oldClass);
      if (oldIndex !== -1) {
        classes.splice(oldIndex, 1);
      }
    }

    propertyMap.set(normalizedProperty, cls);
  }

  return classes.join(' ');
}
