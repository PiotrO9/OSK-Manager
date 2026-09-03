# Types (`app/types/`)

Domain types and response normalizers are grouped by feature area. Keep
generated OpenAPI types in `generated/` and keep hand-written domain types near
the UI/API area that owns them.

| Folder         | Responsibility                                                    |
| -------------- | ----------------------------------------------------------------- |
| `courses/`     | Course, course type, and course creation/update models.           |
| `demo/`        | Demo/design-system-only type shapes.                              |
| `events/`      | Event and instructor-event DTOs.                                  |
| `generated/`   | Generated OpenAPI output. Do not hand-edit by domain.             |
| `instructors/` | Instructor profile, availability, and slot models.                |
| `lessons/`     | Lesson booking, lesson ratings, and manager lesson detail models. |
| `payments/`    | Payment DTOs for student and manager views.                       |
| `schedule/`    | Shared schedule item/person reference models.                     |
| `schools/`     | Driving school and school availability models.                    |
| `students/`    | Student list/detail/process-status models.                        |
| `vehicles/`    | Vehicle list/detail/write models.                                 |

Prefer importing through explicit domain paths, for example
`~/types/vehicles/vehicle`, instead of adding root-level type files.
