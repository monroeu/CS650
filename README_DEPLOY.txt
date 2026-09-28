CS650 Chapter 3 Participation — Supabase Backend Version

Backend status
- Supabase project: irnrjzeejalbbqdrbzmj
- Course: CS650 — Artificial Intelligence
- Fall 2026 section container: CS650-F26
- Assignment slug: chapter-03-solving-problems-by-searching
- Required server-tracked interactions:
  * 89 lecture pages
  * 61 study cards
  * 33 multiple-choice knowledge checks
  * Total: 183 required interactions
- Published: yes
- Login: Supabase email/password authentication
- Roster matching: server_section_roster by school email
- Completion receipt: server-authoritative PDF with verification code

Deployment
1. Upload the contents of this folder to the root of the CS650 GitHub Pages repository.
2. Preserve the assets/slides folder exactly; it contains all 89 lecture-slide images.
3. Open the deployed page and confirm the Student Login panel appears.
4. Load the CS650 roster into the CS650-F26 section before students begin.

Roster fields
The backend roster table uses:
- expected_full_name
- email
- institutional_id
- roster_status

Use the included CS650_roster_template.csv as a preparation template. Set roster_status to active (or invited).

Student workflow
1. Student opens the CS650 participation page.
2. Student creates an account/signs in using the SAME school email on the instructor roster.
3. Supabase matches that email to CS650-F26 and links the authenticated user to the enrollment.
4. The page starts or resumes the student's Chapter 3 participation session.
5. Viewing lecture pages, opening study cards, and answering knowledge checks are recorded to Supabase.
6. When Supabase marks the participation COMPLETE, the Download participation PDF button becomes available.
7. The PDF contains student identity, course/term/section, completion timestamp, and verification code for Blackboard submission.

Important
- The page intentionally blocks participation until the signed-in email is rostered.
- CS650-F26 is the Fall 2026 section container created because the supplied course materials did not state an official Monroe section number. If you later provide the official section code, it can be renamed without changing the assignment logic.
