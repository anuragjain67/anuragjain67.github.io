# Recruiter review — 12 October 2026

The site communicates a distinctive engineering identity and a clear current
specialism in MAPF. Its strongest work evidence is the Erlang decomposition:
personal ownership, a concrete architectural result, and a transition carried
out alongside live operations. The main weaknesses were recruiter scanning and
navigation: contact was buried, career history was compressed, and technical
writing was harder to find than the chronological archive's first personal post.

The changes below address those weaknesses using the existing public biography,
the user's corrections, and verified employer dates and responsibilities from
the supplied resume. The resume itself is not published. The June 2013 start
specified by the user takes precedence over the earlier internship date.

## Scope and method

Reviewed the current repository in a fresh Jekyll build using local Chromium,
on desktop at 1440 × 1000 and mobile at 390 × 844. The recruiter journey is:
identify current work and seniority, understand ownership, scan career history,
inspect leadership responsibilities, find technical writing, and reach LinkedIn.
All screenshots below were captured and inspected during this review.

This is a usability/content review of the local build. It does not establish
recruiter conversion, full accessibility compliance, external profile accuracy,
or events in the live Google Analytics property. No connected in-app browser
was exposed; local Chromium provided the visual and interaction evidence.

## 1. Introduction — clear; contact discoverability fixed

**Finding:** The opening already identified current MAPF leadership, employer,
core languages, title, and experience. The only prominent action was exploring
work; a recruiter had to find LinkedIn much farther down the page.

**Addressed:** Added a direct LinkedIn action alongside Explore my work, emphasized
the management title, and made the page title identify the role and specialism.
The approved first-person introduction and work/title/experience order remain.
LinkedIn is visible in the initial 390 px mobile viewport. The experience figure
continues to calculate from June 2013.

![Introduction before](/tmp/recruiter-audit/01-introduction-before.png)

![Introduction after](/tmp/recruiter-audit/01-introduction-after.png)

## 2. MAPF ownership — clearer; interaction label fixed

**Finding:** The visual explains the domain, but the accompanying text emphasized
general focus more than the work Anurag is leading. The Step button was visually
an icon despite instructions referring to it by name.

**Addressed:** Added a compact ownership label and a first-person description of
leading the software rearchitecture. The next-work link now explicitly names
monolith decomposition. Step has a visible label alongside its accessible name.
The examples retain their illustrative status and checked schedules.

![MAPF before](/tmp/recruiter-audit/02-work-before.png)

![MAPF after](/tmp/recruiter-audit/02-work-after.png)

## 3. Architecture evidence — strong

**Finding:** This section already provided concrete evidence: led a large Erlang
monolith decomposition, independently deployable microservices, and the challenge
of coordinating the transition alongside ongoing operations and development.

**Decision:** Retained that approved explanation and its prominent diagram.
The shared agent guidance now records that the service boundaries were already
defined, so future edits do not reintroduce the earlier mistaken framing.

![Architecture](/tmp/recruiter-audit/03-architecture-after.png)

## 4. Career progression — scannable

**Finding:** Employer history and founding-engineer experience were packed into
one About paragraph, without a clear career overview or employment dates.

**Addressed:** Added Experience to shared navigation and a separate career
section. It shows GreyOrange from May 2015 onward, HashedIn from June 2013 to
April 2015, progression through software engineering and architecture into
management, and the main work already described publicly. The current management
role is distinguished from the full GreyOrange tenure. HashedIn is described as
client development, with customer names omitted.

![Career after](/tmp/recruiter-audit/04-career-after.png)

## 5. Leadership and contact — more concrete

**Finding:** The About section conveyed an interest in mentoring and architecture,
but offered little detail about management responsibilities. The career paragraph
also competed with those responsibilities.

**Addressed:** Moved career history into its own section and made About describe
architecture reviews, mentoring, hiring/onboarding, and coordination of delivery
across teams. These responsibilities are supported by the supplied resume.
Education and the existing profile links remain easy to find. Added two direct
links to real technical articles from the notebook.

![About before](/tmp/recruiter-audit/04-background-contact-before.png)

![About after](/tmp/recruiter-audit/05-background-contact-after.png)

## 6. Writing — technical entry points visible

**Finding:** The newest archive entry is a personal reflection from 2017. A
recruiter entering here could miss the technical material or infer that the page
represented recent engineering work.

**Addressed:** Contextualized the archive as earlier engineering notes and placed
Python concurrency/GIL and Git branching links near the introduction. Kept the
chronological archive, original article dates/URLs, search, topic filters, RSS,
and poetry exclusions.

![Writing before](/tmp/recruiter-audit/05-writing-before.png)

![Writing after](/tmp/recruiter-audit/06-writing-after.png)

## Mobile evidence

The mobile introduction exposes both work and contact actions. Navigation wraps
when needed, the career heading is concise, employer dates can stack, and career
and article links remain readable without horizontal scrolling.

![Mobile introduction](/tmp/recruiter-audit/07-mobile-introduction-after.png)

![Mobile career](/tmp/recruiter-audit/08-mobile-career-after.png)

![Mobile About and contact](/tmp/recruiter-audit/09-mobile-contact-after.png)

## Verification and limits

- Production Jekyll build passed; all 19 Node experience/schedule tests passed.
- Chromium checks passed for recruiter actions, section navigation, employment
  dates, ownership text, dynamic experience, skip-link keyboard focus, labeled
  stepping, and switching every MAPF scenario.
- No horizontal overflow on homepage/writing at 320, 390, 768, 1024, and 1440 px.
- Both technical shortcuts resolve through Jekyll's extensionless article URLs.
  Archive search/topic/clear controls, article navigation, RSS, tags, and selected
  writing work. Eight non-poetry entries remain.
- Career/contact information and the experience fallback remain available without
  JavaScript. No homepage/writing JavaScript errors or failed asset requests.
- Screenshot inspection confirms readable hierarchy and visible focus; this is
  not a full screen-reader, contrast, or cross-browser audit.
- External LinkedIn/GitHub destinations were checked against configured URLs;
  profile content and external sign-in flows were not inspected.

Test setup initially used a static Python server that did not implement Jekyll's
extensionless HTML routing. Checking against Jekyll confirmed the article URLs
resolve correctly. Browser checks also needed to await navigation and debounced
search before asserting results; those waits were corrected without changing
the application's behavior or weakening the expected outcomes.

Functional results: `/tmp/recruiter-audit/checks.json`.

The next useful content improvement would be a first-person case study about a
specific decomposition decision and its trade-offs. The available material
supports the overview above but does not establish those detailed decisions;
they have not been invented for the site.
