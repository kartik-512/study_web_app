# StudyFlow

A lightweight, privacy-first study planner and progress tracker for students.

![StudyFlow](https://img.shields.io/badge/StudyFlow-Study%20Planner-blue) ![License](https://img.shields.io/badge/license-MIT-green)

StudyFlow helps you plan study sessions, estimate time, and track daily progress — all in the browser.

## Key Features

- **Add tasks:** Create tasks with subject, topic, date, and estimated duration.
- **Multiple subjects:** Use built-in subjects or add your own.
- **Time estimates:** Choose durations from 15 minutes up to 3 hours.
- **Progress tracking:** Mark tasks complete and view daily completion percentage.
- **Views:** Filter tasks by Today, Upcoming, Overdue, or Completed.
- **Local persistence:** Tasks are stored in Local Storage (no server required).
- **Responsive UI:** Works well on desktop and mobile.

## Quick Start

No install — open the app in any modern browser:

Windows:

start index.html

macOS:

open index.html

Linux:

xdg-open index.html

Or clone the repo and open `index.html`:

```bash
git clone https://github.com/kartik-512/study_web_app.git
cd study_web_app
start index.html  # or use the appropriate command for your OS
```

## How to Use

1. Click the Add Study Task button and fill in subject, topic, date, and duration.
2. Mark tasks as complete when finished to update your daily progress.
3. Use the Today / Upcoming / Overdue / Completed filters to manage tasks.
4. Delete tasks you no longer need; all changes save automatically.

## Project Structure

```
study_web_app/
├── index.html    # App UI
├── script.js     # App logic
├── styles.css    # Styling
└── README.md     # This file
```

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage API

## Privacy

All data remains in the browser's Local Storage — nothing is transmitted to external servers.

## Roadmap

- Study time notifications
- Weekly/monthly reports
- Export / import tasks
- Dark mode
- Recurring tasks
- Optional cloud sync

## Browser Support

Modern Chrome, Edge, Firefox, Safari, and mobile browsers.

## Contributing

Contributions are welcome. Please open issues or submit pull requests with improvements or bug fixes.

## License

MIT — see the LICENSE file for details.

---

Happy studying!

Plan · Track · Succeed
