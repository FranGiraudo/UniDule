import re

with open('src/pages/Stats.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# We need to insert the streak calculation before `return (`
streak_logic = """
  // Streak Calculation (MEJ-015)
  let currentStreak = 0;
  let d = new Date();
  d.setHours(0,0,0,0);
  
  const hasActivityOnDate = (dateObj: Date) => {
    const ds = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    const hasEvent = eventCompletions.some((c: any) => c.date_str === ds);
    const hasStudy = studySessions.some((s: any) => {
       const cd = new Date(s.completed_at || s.created_at || new Date());
       return cd.getFullYear() === dateObj.getFullYear() && cd.getMonth() === dateObj.getMonth() && cd.getDate() === dateObj.getDate();
    });
    return hasEvent || hasStudy;
  };

  let checkDate = new Date(d);
  if (!hasActivityOnDate(checkDate)) {
    // If no activity today, start checking from yesterday. 
    // The streak isn't lost until tomorrow if today remains empty.
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    if (hasActivityOnDate(checkDate)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
"""

text = text.replace("return (", f"{streak_logic}\n  return (")

# And we want to display the streak in the UI. 
# There's usually a stats grid at the top.
# Let's see how `Stats.tsx` looks.
with open('src/pages/Stats.tsx', 'w', encoding='utf-8') as f:\n    f.write(text)
with open('src/pages/Stats.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
