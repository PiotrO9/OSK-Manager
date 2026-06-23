# OSK Manager UI Redesign View Specs

Ten dokument jest praktyczna lista kontrolna dla redesignu aktualnych widokow OSK Managera. Opisuje, co dany widok obecnie zawiera, co powinien zachowac po redesignie oraz jakie wzorce UI nalezy zastosowac.

Uzywaj razem z:

- `docs/UI_REDESIGN_GUIDELINES.md`
- `docs/UI_COMPONENT_PATTERNS.md`
- `docs/UI_REDESIGN_IMPLEMENTATION_PLAN.md`
- `docs/UI_REDESIGN_VIEW_BACKLOG.md`
- `docs/UI_REDESIGN_IMPLEMENTATION_TODO.md`
- `docs/ui-redesign-mockups/`

## Status legend

- `[ ]` - not started
- `[~]` - in progress
- `[x]` - done
- `[!]` - needs decision

## Global checklist for every view

Przy kazdym widoku sprawdz:

- [ ] Zachowano sens widoku i flow biznesowy.
- [ ] Zachowano wszystkie dane widoczne przed redesignem.
- [ ] Zachowano wszystkie akcje uzytkownika.
- [ ] Zachowano loading, empty, error, disabled i success states, jezeli istnieja.
- [ ] Uzyto globalnych komponentow, jezeli wzorzec jest powtarzalny.
- [ ] Widok ma sensowny wariant desktop i mobile.
- [ ] Nie zmieniono routingu, middleware, kontraktow API/BFF ani walidacji.
- [ ] Sprawdzono odpowiadajace mockupy PNG desktop/mobile z `docs/ui-redesign-mockups/`.
- [ ] Nie dodano fikcyjnych danych ani akcji tylko dlatego, ze sa widoczne na mockupie.
- [ ] Braki wzgledem mockupu zapisano w `UI_REDESIGN_IMPLEMENTATION_TODO.md`.

## Foundation TODO

- [ ] `PageHeader` - wspolny naglowek strony.
- [ ] `StatusBadge` - wspolne statusy domenowe.
- [ ] `EmptyState` - puste stany list, tabel i harmonogramow.
- [ ] `LoadingState` - stabilne loadingi i skeletony.
- [ ] `ErrorState` - bledy blisko miejsca, ktorego dotycza.
- [ ] `FilterBar` - wspolne filtry dla list i harmonogramow.
- [ ] `DataTableShell` - tabele/listy z toolbar, states i paginacja.
- [ ] `ActionGroup` - spojne grupowanie akcji.
- [ ] `DetailLayout` - uklady szczegolow encji.
- [ ] `FormSection` - logiczne sekcje formularzy.
- [ ] `ScheduleLayout` - wspolne zasady kalendarzy i harmonogramow.

---

## Manager Core

### Manager Students List

Path: `app/pages/manager/students/index.vue`  
Status: `[ ]`  
Priority: `P0`  
Role: `manager`  
Type: `list`

Current components:

- `ManagerStudentFormDialog`
- `ManagerStudentAssignCourseDialog`
- `UiButton`
- `UiSelect`
- `UiLabel`
- `NuxtLink`
- icons: `Users`, `UserPlus`

Currently contains:

- school list loading and active school selection;
- optional course filter;
- paginated students table;
- create student action and dialog;
- assign student to course action and dialog;
- student details link with `schoolId` query;
- route-driven create dialog via `register=1`;
- optional `schoolId` prefill from query;
- toast feedback after create and assign actions;
- loading, empty and error states for schools, courses and students.

After redesign should contain:

- `PageHeader` with title, short context and primary action "Dodaj kursanta";
- `FilterBar` with school and course filters;
- `DataTableShell` for the students table and pagination;
- `ActionGroup` for row actions: open details, assign course;
- `EmptyState`, `LoadingState`, `ErrorState`;
- dialog styling aligned with `FormSection`.

Do not lose:

- `schoolId` query handling;
- `register=1` opening behavior;
- create student flow;
- assign-to-course flow;
- pagination;
- course filter reset when school changes;
- list refresh after create and assign;
- all toast success/error messages.

### Manager Student Details

Path: `app/pages/manager/students/[userId].vue`  
Status: `[ ]`  
Priority: `P1`  
Role: `manager`  
Type: `details`

Current components:

- `ManagerStudentProcessStatus`
- `ManagerStudentNotes`
- `ManagerScheduleLessonTable`
- `StudentPaymentsList`
- `UiBadge`
- `UiButton`
- `NuxtLink`

Currently contains:

- student profile data loaded by `userId` and `schoolId`;
- missing `schoolId` and not found error handling;
- process status panel;
- student notes;
- payments list;
- weekly lessons/schedule section;
- back navigation to students list;
- loading and error states for student, process status, payments and schedule.

After redesign should contain:

- `PageHeader` with student name and back action;
- `DetailLayout` with summary/sidebar plus main operational panels;
- `EntitySummaryCard` for identity, contact and PKK/course context;
- `StatusBadge` for course/process statuses;
- `DataTableShell` or list shell for lessons and payments;
- `EmptyState`, `LoadingState`, `ErrorState` per section.

Do not lose:

- requirement for `schoolId` query;
- all separate load states;
- process status steps;
- notes behavior;
- payments section;
- weekly lessons section;
- dynamic page title from student name.

### Manager Instructors List

Path: `app/pages/manager/instructors/index.vue`  
Status: `[ ]`  
Priority: `P1`  
Role: `manager`  
Type: `list`

Current components:

- `ManagerInstructorFormDialog`
- `UiButton`
- `UiSelect`
- `UiLabel`
- `NuxtLink`
- icon: `GraduationCap`

Currently contains:

- school list loading and selection;
- instructors list for active school;
- create instructor action and dialog;
- details navigation;
- loading, empty and error states;
- toast feedback after instructor creation.

After redesign should contain:

- `PageHeader` with primary action "Dodaj instruktora";
- `FilterBar` for school selection;
- `DataTableShell` for instructors;
- `ActionGroup` for row actions;
- `StatusBadge` for availability/activity if available;
- `EmptyState`, `LoadingState`, `ErrorState`;
- create dialog aligned with `FormSection`.

Do not lose:

- school selection behavior;
- create instructor flow;
- list refresh after creation;
- details links;
- existing validation and toast messages.

### Manager Instructor Details

Path: `app/pages/manager/instructors/[id]/index.vue`  
Status: `[x]`  
Priority: `P1`  
Role: `manager`  
Type: `details`

Current components:

- `ManagerInstructorEditDialog`
- `ManagerInstructorDeleteDialog`
- `ManagerInstructorWeeklyAvailabilityPreview`
- `LessonRatingsSummary`
- `UiBadge`
- `UiButton`
- `NuxtLink`

Currently contains:

- instructor profile/detail data;
- course type qualifications;
- weekly availability preview;
- ratings summary;
- edit instructor dialog;
- delete instructor confirmation;
- navigation to availability, schedule and slots;
- loading, error and not found handling.

After redesign should contain:

- `PageHeader` with instructor name and primary/secondary actions;
- `DetailLayout` with profile summary and operational sections;
- `EntitySummaryCard` for instructor identity and qualifications;
- `ScheduleLayout` preview for availability;
- `StatusBadge` for qualifications/activity;
- `ActionGroup` for edit, delete and related views.

Do not lose:

- edit dialog behavior;
- delete confirmation and redirect behavior;
- course qualification display;
- availability preview;
- ratings summary;
- links to schedule, slots and availability.

### Manager School Schedule

Path: `app/pages/manager/schedule/index.vue`  
Status: `[ ]`  
Priority: `P1`  
Role: `manager`  
Type: `schedule`

Current components:

- `ManagerSchoolScheduleCalendar`

Currently contains:

- school id from query or default OSK from session;
- missing school id error;
- weekly school schedule calendar;
- event edit enabled mode;
- explanatory text about clicking editable blocks.

After redesign should contain:

- `PageHeader` with active school/week context;
- `FilterBar` or compact context selector for school/week;
- `ScheduleLayout` around `ManagerSchoolScheduleCalendar`;
- `ErrorState` for missing school id;
- concise operational copy.

Do not lose:

- query `schoolId` fallback behavior;
- default OSK fallback;
- event edit enabled behavior;
- missing school id message.

---

## Operational Views

### Manager Courses List

Path: `app/pages/manager/courses/index.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `manager`  
Type: `list`

Current components:

- `UiSelect`
- `UiButton`
- `UiBadge`
- `UiLabel`
- `NuxtLink`
- icon: `BookOpen`

Currently contains:

- school selection;
- courses list;
- create course link;
- course details links;
- category/kind/status-like metadata badges;
- loading, empty and error states.

After redesign should contain:

- `PageHeader` with "Nowy kurs" action;
- `FilterBar` with school filter;
- `DataTableShell` or dense course list;
- `StatusBadge` for course kind/status;
- `ActionGroup` for details/edit actions.

Do not lose:

- selected school behavior;
- create course route;
- course details navigation;
- current course metadata.

### Manager Course Details

Path: `app/pages/manager/courses/[id].vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `manager`  
Type: `details`

Current components:

- `UiCard`
- `UiBadge`
- `UiButton`
- `UiSelect`
- `UiLabel`
- `NuxtLink`
- icons: `ArrowLeft`, `BookOpen`, `User`

Currently contains:

- course detail load by id;
- course metadata and schedule/theory details;
- instructor assignment/select;
- save instructor action;
- back navigation;
- loading, error and not found states;
- toast feedback after instructor update.

After redesign should contain:

- `PageHeader` with course name and back action;
- `DetailLayout` for course summary and editable assignments;
- `EntitySummaryCard` for course metadata;
- `FormSection` for instructor assignment;
- `StatusBadge` for course category/kind/status.

Do not lose:

- instructor assignment behavior;
- save disabled/loading states;
- current error handling;
- dynamic title from course name.

### Manager Course New

Path: `app/pages/manager/courses/new.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `manager`  
Type: `form`

Current components:

- `CourseCreateForm`
- `NuxtLink`

Currently contains:

- school and instructor data loading for form options;
- course creation form;
- back navigation;
- create success redirect/toast;
- load and submit error handling.

After redesign should contain:

- `PageHeader` with back action;
- `FormSection` based structure inside `CourseCreateForm` or wrapper;
- `ActionGroup` for submit/cancel;
- `ErrorState` for blocked form states.

Do not lose:

- all form fields and validation;
- school/instructor option loading;
- success redirect;
- error handling and toasts.

### Vehicles List

Path: `app/pages/vehicles/index.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `manager`  
Type: `list`

Current components:

- `VehiclesListPanel`

Currently contains:

- vehicles list panel;
- vehicle create navigation;
- vehicle details/edit/delete actions inside panel;
- active/default/status badges;
- empty state and loading/error handling inside panel.

After redesign should contain:

- `PageHeader` at page level or inside panel;
- `DataTableShell` or refined card/list layout;
- `EntitySummaryCard` for vehicle rows/cards;
- `StatusBadge` for active/default/availability;
- `ActionGroup` for details, edit, delete.

Do not lose:

- current vehicle actions;
- default vehicle state;
- active/availability status;
- delete confirmation flow;
- photo/status data display.

### Vehicle Details

Path: `app/pages/vehicles/[id]/index.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `manager`  
Type: `details`

Current components:

- `VehicleDetail`
- `UiBadge`
- `NuxtLink`

Currently contains:

- vehicle detail load by id;
- status/default/active badges;
- registration and vehicle metadata;
- back/edit navigation;
- loading, error and not found states.

After redesign should contain:

- `PageHeader` with vehicle name/registration;
- `DetailLayout`;
- `EntitySummaryCard` for vehicle core data;
- `StatusBadge` for active/default/availability;
- `ActionGroup` for back/edit.

Do not lose:

- all vehicle metadata;
- edit route;
- loading/error/not found states.

### Vehicle Edit

Path: `app/pages/vehicles/[id]/edit.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `manager`  
Type: `form`

Current components:

- `VehicleForm`
- `NuxtLink`

Currently contains:

- vehicle detail loading;
- edit form with existing vehicle data;
- save behavior;
- file/photo related typing;
- back navigation;
- loading and error states.

After redesign should contain:

- `PageHeader` with vehicle context;
- `FormSection` wrapper for `VehicleForm`;
- `ActionGroup` for save/cancel/back;
- `ErrorState` for load or save errors.

Do not lose:

- existing form behavior;
- prefilled data;
- upload/photo behavior;
- success/error flows.

### Vehicle New

Path: `app/pages/vehicles/new.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `manager`  
Type: `form`

Current components:

- `VehicleForm`
- `NuxtLink`

Currently contains:

- new vehicle form;
- back navigation;
- create/save flow;
- validation and loading states inside form.

After redesign should contain:

- `PageHeader`;
- `FormSection` wrapper;
- `ActionGroup` for submit/back;
- `ErrorState` if form exposes errors.

Do not lose:

- all vehicle fields;
- save behavior;
- validation and disabled states.

### Manager OSK List

Path: `app/pages/manager/osk/index.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `manager`  
Type: `list`

Current components:

- `ManagerOskListGrid`
- `ManagerOskSchoolFormDialog`
- `ManagerOskDeleteDialog`

Currently contains:

- driving schools list/grid;
- add/edit school dialog;
- delete school dialog;
- set default school behavior inside grid;
- loading, empty and error states.

After redesign should contain:

- `PageHeader` with add OSK action;
- `DataTableShell` or refined grid using `EntitySummaryCard`;
- `StatusBadge` for default/current states;
- `ActionGroup` for edit/delete/default;
- shared dialog/form styling.

Do not lose:

- add/edit/delete flows;
- set default behavior;
- empty state;
- current grid actions.

### Manager OSK New Redirect

Path: `app/pages/manager/osk/new.vue`  
Status: `[ ]`  
Priority: `P3`  
Role: `manager`  
Type: `redirect`

Current components:

- none; route redirects to `/manager/osk`.

Currently contains:

- compatibility redirect for old bookmarks/external links;
- status text while redirecting.

After redesign should contain:

- no functional redesign required;
- optional `LoadingState`/status text aligned with shared states if touched.

Do not lose:

- redirect to `/manager/osk`;
- `replace: true` behavior.

### Manager Reviews

Path: `app/pages/manager/reviews/index.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `manager`  
Type: `list`

Current components:

- `ManagerLessonRatingsFilters`
- `LessonRatingsSummary`
- `LessonRatingsTable`

Currently contains:

- school/instructor/period filters;
- ratings summary;
- lesson ratings table;
- loading and error states for filters/data;
- manager-only review analysis.

After redesign should contain:

- `PageHeader`;
- `FilterBar` wrapping existing filters or replacing their layout;
- `SummaryStrip` for rating metrics;
- `DataTableShell` for ratings;
- `StatusBadge` if rating/status labels need standardization.

Do not lose:

- all filter behavior;
- ratings summary metrics;
- table data;
- period handling.

### Shared Events Index

Path: `app/pages/events/index.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `manager/instructor`  
Type: `schedule`

Current components:

- `ManagerEventStatusSelect`
- `UiCalendar`
- `UiPopover`
- `UiBadge`
- `UiButton`
- icons: `ChevronLeft`, `ChevronRight`

Currently contains:

- daily events view for managers/instructors;
- date navigation and calendar picker;
- status filtering/selection;
- event list/cards;
- loading, empty and error states;
- role-aware behavior via middleware.

After redesign should contain:

- `PageHeader` with active date context;
- `FilterBar` for date/status;
- `ScheduleLayout` or dense day agenda layout;
- `StatusBadge` for event statuses;
- `ActionGroup` for event actions.

Manager schedule grid:

- base implementation exists: manager can switch between `Harmonogram` and `Lista`;
- grid columns represent instructors from the instructors list API, with event fallbacks grouped by `event.instructor`;
- rows represent hourly bands for the selected day;
- event cards stay based on real schedule data only;
- current implementation does not add mocked events, conflicts, free windows or new create actions;
- mobile uses the compact list view instead of forcing a wide multi-column grid;
- future enhancement: exact minute-based positioning, conflict indicators, free-window hints and grouped mobile sections per instructor.

Do not lose:

- date navigation;
- calendar popover;
- status behavior;
- manager-or-instructor access;
- event actions and route links.

### Manager Event Edit

Path: `app/pages/manager/events/[id]/edit.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `manager`  
Type: `form`

Current components:

- `ManagerEventEditContainer`

Currently contains:

- thin page wrapper around event edit container;
- manager middleware.

After redesign should contain:

- keep page wrapper thin unless container needs shared `PageHeader`;
- apply `FormSection`, `ActionGroup` and `ErrorState` inside `ManagerEventEditContainer` when redesigning the container.

Do not lose:

- route behavior;
- manager middleware;
- all behavior owned by `ManagerEventEditContainer`.

### Manager Lesson Edit

Path: `app/pages/manager/lessons/[id]/edit.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `manager`  
Type: `form`

Current components:

- `UiDateTimePicker`
- `UiSelect`
- `UiButton`
- `UiLabel`
- `NuxtLink`

Currently contains:

- practical lesson detail load;
- edit start/end time;
- instructor/student/course/vehicle selects where applicable;
- save behavior;
- loading, error and not found states;
- toast on successful save.

After redesign should contain:

- `PageHeader` with lesson context and back action;
- `EntitySummaryCard` for current lesson snapshot;
- `FormSection` for editable lesson data;
- `ActionGroup` for save/cancel;
- `ErrorState` for load/save failures.

Do not lose:

- all select options and dependencies;
- date-time picker behavior;
- save disabled/loading states;
- successful save toast;
- current validation/error logic.

### Instructor Availability

Path: `app/pages/manager/instructors/[id]/availability.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `manager`  
Type: `schedule`

Current components:

- `ManagerInstructorAvailabilityEditor`
- `NuxtLink`

Currently contains:

- instructor availability editor;
- back/navigation context;
- manager middleware.

After redesign should contain:

- `PageHeader` with instructor availability context;
- `ScheduleLayout` wrapper around editor;
- `ActionGroup` for navigation/save if exposed by editor;
- shared states inside editor if applicable.

Do not lose:

- editor behavior;
- route parameters;
- back navigation.

### Instructor Schedule

Path: `app/pages/manager/instructors/[id]/schedule.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `manager`  
Type: `schedule`

Current components:

- `ManagerScheduleLessonTable`
- `ManagerInstructorEventDeleteDialog`
- `UiDateTimePicker`
- `UiSelect`
- `UiButton`
- `UiLabel`
- `NuxtLink`

Currently contains:

- instructor lessons and blocks;
- create/edit block time form;
- delete block confirmation;
- course/vehicle related data;
- loading, empty and error states;
- toast feedback for save/delete.

After redesign should contain:

- `PageHeader` with instructor schedule context;
- `ScheduleLayout` or table/list hybrid;
- `FormSection` for block creation/editing;
- `ActionGroup` for save/delete/navigation;
- `StatusBadge` for event statuses.

Do not lose:

- block creation/edit/delete;
- date-time behavior;
- linked lesson table;
- save/delete toasts;
- current error handling.

### Instructor Slots

Path: `app/pages/manager/instructors/[id]/slots.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `manager`  
Type: `schedule`

Current components:

- `ManagerInstructorWeeklyCalendar`
- `NuxtLink`

Currently contains:

- weekly instructor slots calendar;
- instructor route context;
- back/navigation link;
- loading/error states inside calendar.

After redesign should contain:

- `PageHeader`;
- `ScheduleLayout` around weekly calendar;
- `EmptyState`/`LoadingState` if exposed;
- compact navigation actions.

Do not lose:

- weekly calendar behavior;
- route id context;
- navigation link.

### Manager Instructor New Redirect

Path: `app/pages/manager/instructors/new.vue`  
Status: `[ ]`  
Priority: `P3`  
Role: `manager`  
Type: `redirect`

Current components:

- none; route redirects to `/manager/instructors`.

Currently contains:

- compatibility redirect for old bookmarks/external links;
- preserves query parameters;
- status text while redirecting.

After redesign should contain:

- no functional redesign required;
- optional shared redirect/loading state if touched.

Do not lose:

- redirect to `/manager/instructors`;
- query preservation;
- `replace: true` behavior.

---

## Student / Instructor Views

### My Lessons

Path: `app/pages/my-lessons.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `student/instructor`  
Type: `schedule`

Current components:

- `ManagerSchoolScheduleCalendar`
- `ManagerScheduleLessonTable`
- `StudentScheduleGroupedList`
- `StudentLessonRatingsPanel`
- `UiDialog`
- `UiButton`

Currently contains:

- role-aware lesson view for student or instructor;
- weekly calendar/table/list variants;
- lesson rating flow for completed student lessons;
- lesson cancellation dialog;
- loading, empty and error states;
- toast feedback after rating/cancellation.

After redesign should contain:

- `PageHeader` with role-aware context;
- `ScheduleLayout` for lesson presentation;
- `StatusBadge` for lesson states;
- `ActionGroup` for cancellation/rating;
- dialogs aligned with shared destructive/action patterns.

Do not lose:

- student and instructor role behavior;
- rating flow;
- cancellation confirmation;
- weekly navigation;
- all current schedule data.

### Book Lesson

Path: `app/pages/book-lesson.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `student`  
Type: `booking`

Current components:

- `StudentLessonBookingCourseSelect`
- `StudentLessonBookingWeekNav`
- `StudentLessonBookingSlotList`
- `UiButton`
- `NuxtLink`
- icon: `CalendarCheck`

Currently contains:

- eligible/current user courses;
- selected course;
- weekly navigation;
- available slot list;
- booking action;
- success/error toasts;
- loading, empty and error states.

After redesign should contain:

- `PageHeader` with booking context;
- `FilterBar` for course/week selection;
- `ScheduleLayout` or booking slot layout;
- `EmptyState`, `LoadingState`, `ErrorState`;
- clear selected course and week context.

Do not lose:

- course selection;
- week navigation;
- slot booking;
- success/error toasts;
- student middleware.

### My Courses

Path: `app/pages/my-courses.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `student/instructor`  
Type: `list`

Current components:

- `UiBadge`
- icon: `BookOpen`

Currently contains:

- current user courses;
- course cards/list items;
- course status/category badges;
- loading, empty and error states.

After redesign should contain:

- `PageHeader`;
- `DataTableShell` or compact card list;
- `EntitySummaryCard` for course rows/cards;
- `StatusBadge`;
- `EmptyState`/`LoadingState`/`ErrorState`.

Do not lose:

- all course metadata;
- current role-neutral behavior;
- status badges.

### My Payments

Path: `app/pages/my-payments.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `student`  
Type: `list`

Current components:

- `StudentPaymentsList`

Currently contains:

- student payments list;
- payment status display;
- loading, empty and error states.

After redesign should contain:

- `PageHeader`;
- optional `SummaryStrip` for totals if data is available;
- `DataTableShell` or refined list through `StudentPaymentsList`;
- `StatusBadge` for payment states.

Do not lose:

- all payment rows;
- payment status labels;
- student middleware;
- current loading/error behavior.

### My Reviews

Path: `app/pages/my-reviews.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `instructor`  
Type: `list`

Current components:

- `LessonRatingsTable`

Currently contains:

- instructor lesson ratings;
- ratings table;
- loading, empty and error states.

After redesign should contain:

- `PageHeader`;
- `DataTableShell` around ratings;
- `StatusBadge` if ratings need status labels;
- `EmptyState`/`LoadingState`/`ErrorState`.

Do not lose:

- instructor middleware;
- ratings data;
- existing table behavior.

---

## Shared / Public / Internal Views

### Dashboard

Path: `app/pages/index.vue`  
Status: `[ ]`  
Priority: `P2`  
Role: `shared`  
Type: `dashboard`

Current components:

- `ManagerSchoolWeeklyAvailabilityCalendar`
- `NuxtLink`
- icons: `Building2`, `CalendarDays`, `MapPin`, `ExternalLink`

Currently contains:

- role-aware welcome copy;
- manager default OSK load and fallback redirect to OSK list if not configured;
- default OSK card;
- weekly school availability calendar;
- instructor/student assigned schools list;
- loading and error states.

After redesign should contain:

- `PageHeader` with role-aware greeting;
- `SummaryStrip` if useful metrics become available;
- `EntitySummaryCard` for OSK/school identity;
- `ScheduleLayout` for availability calendar;
- `EmptyState` for users without assigned schools.

Do not lose:

- default OSK fetch behavior;
- redirect when default OSK is not configured;
- manager vs student/instructor branches;
- assigned schools display.

### Account

Path: `app/pages/account/index.vue`  
Status: `[ ]`  
Priority: `P3`  
Role: `shared`  
Type: `account`

Current components:

- `AccountProfileNamesFormDialog`
- `AccountProfileContactFormDialog`
- `UiCard`
- `UiBadge`
- `UiButton`

Currently contains:

- profile avatar upload;
- profile names edit dialog;
- contact/description edit dialog;
- file validation for avatar;
- session/profile display;
- toast feedback for profile/avatar updates.

After redesign should contain:

- `PageHeader`;
- `DetailLayout` with profile summary and editable sections;
- `EntitySummaryCard` for identity/session data;
- `FormSection` for editable profile groups;
- `ActionGroup` for edit/upload actions.

Do not lose:

- avatar validation;
- avatar upload;
- names/contact dialog behavior;
- session refresh/update behavior;
- all toast messages.

### Login

Path: `app/pages/login.vue`  
Status: `[ ]`  
Priority: `P3`  
Role: `public`  
Type: `auth`

Current components:

- `UiCard`
- `UiInput`
- `UiButton`

Currently contains:

- email/password login form;
- auth return path behavior;
- already-logged-in handling;
- form validation;
- loading and error states;
- toast feedback.

After redesign should contain:

- auth-specific `FormSection`;
- `ErrorState` for login errors;
- `ActionGroup` for submit;
- visual style aligned with app shell without becoming a landing page.

Do not lose:

- return path behavior;
- login request behavior;
- already logged in handling;
- validation and toasts.

### Design System

Path: `app/pages/design-system.vue`  
Status: `[ ]`  
Priority: `P3`  
Role: `internal`  
Type: `dev`

Current components:

- `Colors`
- `Typography`
- `SectionActions`
- `SectionBadge`
- `SectionBreadcrumbs`
- `SectionCards`
- `SectionDialog`
- `SectionFormControls`
- `SectionLoader`
- `SectionNavigationMenubar`
- `SectionNavTree`
- `SectionSkeleton`
- `SectionSlider`
- `SectionSpinner`
- `SectionToasts`

Currently contains:

- internal design system showcase;
- shadcn and starter component examples;
- dialog/toast demos.

After redesign should contain:

- documentation/showcase for new foundation components;
- examples for `PageHeader`, `StatusBadge`, `EmptyState`, `FilterBar`, `DataTableShell`, `ActionGroup`;
- updated visual tokens after redesign stabilizes.

Do not lose:

- existing useful component examples;
- internal demo behavior;
- design-system route as development reference.

---

## Thin Wrapper / Component-Owned Pages

These pages are mostly wrappers around larger components. Redesign should usually happen inside the referenced component rather than in the page file.

### Manager Event Edit Wrapper

Path: `app/pages/manager/events/[id]/edit.vue`  
Owned component: `ManagerEventEditContainer`

Checklist:

- [ ] Keep page wrapper thin unless adding a shared `PageHeader` at page level is clearly better.
- [ ] Redesign `ManagerEventEditContainer` with `FormSection`, `ActionGroup`, `ErrorState`.
- [ ] Preserve route id, manager middleware and all event edit behavior.

### Vehicles List Wrapper

Path: `app/pages/vehicles/index.vue`  
Owned component: `VehiclesListPanel`

Checklist:

- [ ] Decide whether `PageHeader` belongs in page or panel.
- [ ] Redesign `VehiclesListPanel` with reusable vehicle row/card patterns.
- [ ] Preserve all list actions, delete flow and status/default behavior.

### Manager Availability Wrapper

Path: `app/pages/manager/instructors/[id]/availability.vue`  
Owned component: `ManagerInstructorAvailabilityEditor`

Checklist:

- [ ] Add page-level context only if it improves navigation.
- [ ] Redesign editor internals with `ScheduleLayout`.
- [ ] Preserve all availability edit behavior.

### Manager Slots Wrapper

Path: `app/pages/manager/instructors/[id]/slots.vue`  
Owned component: `ManagerInstructorWeeklyCalendar`

Checklist:

- [ ] Keep calendar behavior unchanged.
- [ ] Use `ScheduleLayout` around existing calendar.
- [ ] Preserve route id and navigation behavior.

---

## Redirect / Compatibility Pages

### Manager Instructor New Redirect

Path: `app/pages/manager/instructors/new.vue`

Checklist:

- [ ] Preserve redirect to `/manager/instructors`.
- [ ] Preserve query forwarding.
- [ ] Optional: replace plain status text with shared `LoadingState` only after foundation exists.

### Manager OSK New Redirect

Path: `app/pages/manager/osk/new.vue`

Checklist:

- [ ] Preserve redirect to `/manager/osk`.
- [ ] Preserve `replace: true`.
- [ ] Optional: replace plain status text with shared `LoadingState` only after foundation exists.

---

## Full current page coverage

This spec covers all current `app/pages` entries:

- [ ] `app/pages/account/index.vue`
- [ ] `app/pages/book-lesson.vue`
- [ ] `app/pages/design-system.vue`
- [ ] `app/pages/events/index.vue`
- [ ] `app/pages/index.vue`
- [ ] `app/pages/login.vue`
- [ ] `app/pages/manager/courses/[id].vue`
- [ ] `app/pages/manager/courses/index.vue`
- [ ] `app/pages/manager/courses/new.vue`
- [ ] `app/pages/manager/events/[id]/edit.vue`
- [ ] `app/pages/manager/instructors/[id]/availability.vue`
- [x] `app/pages/manager/instructors/[id]/index.vue`
- [ ] `app/pages/manager/instructors/[id]/schedule.vue`
- [ ] `app/pages/manager/instructors/[id]/slots.vue`
- [ ] `app/pages/manager/instructors/index.vue`
- [ ] `app/pages/manager/instructors/new.vue`
- [ ] `app/pages/manager/lessons/[id]/edit.vue`
- [ ] `app/pages/manager/osk/index.vue`
- [ ] `app/pages/manager/osk/new.vue`
- [ ] `app/pages/manager/reviews/index.vue`
- [ ] `app/pages/manager/schedule/index.vue`
- [ ] `app/pages/manager/students/[userId].vue`
- [ ] `app/pages/manager/students/index.vue`
- [ ] `app/pages/my-courses.vue`
- [ ] `app/pages/my-lessons.vue`
- [ ] `app/pages/my-payments.vue`
- [ ] `app/pages/my-reviews.vue`
- [ ] `app/pages/vehicles/[id]/edit.vue`
- [ ] `app/pages/vehicles/[id]/index.vue`
- [ ] `app/pages/vehicles/index.vue`
- [ ] `app/pages/vehicles/new.vue`
