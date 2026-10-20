export interface Course {
  title: string;
  org: string;
  period: string;
  /** Not confirmed yet: shown on the site, but the chat assistant never mentions it */
  placeholder?: boolean;
}

export const COURSES: Course[] = [
  { title: 'ChatGPT Prompt Engineering for Developers', org: 'DeepLearning.AI × OpenAI', period: 'Oct 2025' },
  { title: 'AI Engineering', org: 'Coursera', period: 'Aug 2025 – Present' },
  { title: 'Python Full Stack Developer', org: 'Techolas Technologies', period: 'Jan – Sep 2023' },
  { title: 'Red Team CICSA Analyst', org: 'Red Team', period: 'May – Dec 2022' },
];

export interface BlogPost {
  title: string;
  tag: string;
  date?: string;
  content?: { heading: string; body: string }[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    title: 'Thread-Safe Label Generation with MongoDB Atomic Counters',
    tag: 'engineering',
    date: 'Apr 2026',
    content: [
      {
        heading: '',
        body: 'Label numbers sound trivial — until two requests hit the endpoint at the same time and generate the same one, and that label is already printed and stuck to a physical product.',
      },
      {
        heading: 'The Original Code',
        body: 'The existing function counted today\'s labels in the database and used count + 1 as the next sequence number. Clean logic, but with a fatal flaw: between the count read and the new label being written, another request could read the exact same count and generate the same number. Classic race condition.',
      },
      {
        heading: 'Why It\'s a Real Problem',
        body: 'In a warehouse setting, duplicate label numbers aren\'t just a data integrity issue — they break traceability. A QR code that maps to two different inventory items is genuinely useless.',
      },
      {
        heading: 'The Fix: find_one_and_update with $inc',
        body: 'MongoDB\'s find_one_and_update is atomic at the document level. The solution was to maintain a separate clnLabelCounter collection with a counter document per label type, and increment it atomically:\n\n```python\nresult = dbconn.clnLabelCounter.find_one_and_update(\n    {\'_id\': f\'label_{label_type}_{date_prefix}\'},\n    {\'$inc\': {\'sequence\': 1}},\n    upsert=True,\n    return_document=ReturnDocument.AFTER\n)\nsequence = result[\'sequence\']\n```\n\nThis guarantees that no two requests ever get the same sequence number — MongoDB handles the atomicity, no application-level locking needed.',
      },
      {
        heading: 'Additional Wrinkle',
        body: 'The system already had printed labels in production with a previous numbering format. Switching to per-type counters meant the new numbers couldn\'t clash with old ones. That required auditing existing label ranges and seeding the counters at the right starting values — a small migration step that\'s easy to overlook when you\'re focused on the logic fix.',
      },
      {
        heading: 'The Takeaway',
        body: 'Don\'t generate sequential IDs by counting existing records. Use atomic counters. The count-then-insert pattern is always a race condition waiting to happen — it just might not show up until you\'re under load.',
      },
    ],
  },
  {
    title: 'Eliminating N+1 Queries in Django + MongoDB',
    tag: 'performance',
    date: 'Mar 2026',
    content: [
      {
        heading: '',
        body: 'This one came from a real production bug — a Django API endpoint that looked perfectly fine on the surface but was silently hammering the database on every request.',
      },
      {
        heading: 'The Problem',
        body: 'The API exported employee data — names, designations, supervisors, plant assignments. The code looped through employees and for each one, fired individual queries to fetch their supervisor, their plant supervisor document, and their designation. With ~150 employees, a single API call was making 400–500 database roundtrips. Response times were terrible and nobody had noticed because it "worked."',
      },
      {
        heading: 'Diagnosing It',
        body: 'The pattern is classic N+1: one query to get N records, then N more queries to fetch related data one by one. In SQL ORMs you\'d use select_related. In MongoDB with PyMongo, there\'s no magic — you have to build it yourself.',
      },
      {
        heading: 'The Fix',
        body: 'Three changes:\nBatch-fetch before the loop — collect all unique IDs needed (supervisor IDs, designation IDs, plant IDs), fetch them all in one find({\'_id\': {\'$in\': [...]}}) call each, and build lookup dictionaries.\nReplace per-record queries with dict lookups — inside the loop, instead of hitting the DB, you\'re just doing lookup[id].\nUse aggregation pipelines where appropriate — for anything involving joins or computed fields, $lookup in an aggregation pipeline beats application-side joining.\n\nResult: the same endpoint went from ~450 queries to under 10. Response time dropped significantly.',
      },
      {
        heading: 'The Takeaway',
        body: 'MongoDB doesn\'t enforce relational constraints, so N+1 patterns sneak in easily — especially when code grows organically. The fix isn\'t complicated, but you have to consciously look for it. Any time you see a DB call inside a loop, treat it as a red flag until proven otherwise.',
      },
    ],
  },
  {
    title: 'How I Automate My Dev Workflow with Bash Scripts',
    tag: 'tooling',
    date: 'Feb 2026',
    content: [
      {
        heading: '',
        body: 'As a developer working across multiple repositories and sprint-based tickets, context-switching overhead adds up fast. I started writing Bash scripts to eliminate the repetitive parts — cloning repos, checking out branches, opening workspaces — so I could go from ticket to code in seconds.',
      },
      {
        heading: 'The Problem',
        body: 'Every time a new ticket lands, the ritual was the same: open terminal, clone the right repo, create a branch with the right naming convention, set up the workspace in VS Code. Multiply that across a sprint and you\'ve burned a non-trivial chunk of time on pure ceremony.',
      },
      {
        heading: 'What I Built',
        body: 'A set of Bash scripts that handle the full setup flow:\nTakes a ticket number as input\nClones the relevant repositories from Bitbucket\nCreates and checks out a branch named after the ticket\nGenerates a .code-workspace file and opens it in VS Code automatically\nIncludes a resume mode — if you\'ve already set up that ticket, it skips cloning and just reopens the workspace\n\nLater, I extended it to hit the Bitbucket REST API to check PR merge status before cloning, so it can warn you if work already went in.',
      },
      {
        heading: 'Why Bash',
        body: 'Could I have used Python? Sure. But Bash sits right at the shell level — no runtime to install, no dependencies, runs anywhere. For workflow glue, it\'s hard to beat.',
      },
      {
        heading: 'What I Learned',
        body: 'Writing these scripts forced me to think about edge cases I\'d never noticed before — what happens when a branch already exists, when a clone partially fails, or when ticket numbers don\'t follow the expected format. Scripting your own workflow is a surprisingly good way to audit it.',
      },
    ],
  },
  {
    title: 'The Angular Form Binding Bug That Silently Broke ERP Filtering',
    tag: 'debugging',
    date: 'Jan 2026',
    content: [
      {
        heading: '',
        body: 'Some bugs are loud — crashes, stack traces, 500 errors. This one was worse. Everything appeared to work. No errors. The UI responded. Data loaded. But the wrong data was loading, silently, every time.',
      },
      {
        heading: 'The Setup',
        body: 'An inventory management module had a filter with two mutually exclusive radio buttons — "Planned" and "Confirmed" order types. Users would select "Confirmed," the page would seem to respond, and the results would be... the same as Planned. Nobody caught it for a while because the default state happened to match what most users were filtering for anyway.',
      },
      {
        heading: 'The Bug',
        body: 'The Angular template had a two-way binding mismatch on the "Confirmed" radio button:\n\n```html\n<!-- Planned — correct -->\n[(ngModel)]="searchData.planned" [checked]="searchData?.planned"\n\n<!-- Confirmed — broken -->\n[(ngModel)]="searchData.planned" [checked]="searchData?.confimed"\n```\n\nTwo problems in one line. The ngModel binding on "Confirmed" was writing to searchData.planned instead of its own property — so selecting "Confirmed" was actually overwriting the Planned value. And [checked] was referencing searchData.confimed (a typo — missing an \'r\'), a property that didn\'t exist anywhere. So the button never visually registered as selected.\n\nThe result: the model always had Planned-type data regardless of what the user clicked, the "Confirmed" button looked unselected even when clicked, and the filter silently returned wrong results.',
      },
      {
        heading: 'How It Was Found',
        body: 'A cross-branch code comparison between master and dev surfaced it. The same bug was present in both branches, meaning it had been there since the original implementation — just never caught because the default filter state masked it.',
      },
      {
        heading: 'The Fix',
        body: 'Correcting the binding to its own property and fixing the typo. Two characters of change, but understanding exactly why Angular behaves that way — how ngModel and [checked] interact differently — is what actually mattered.',
      },
      {
        heading: 'The Lesson',
        body: 'Silent wrong-data bugs are the worst category of bug. They don\'t fail loudly. They pass casual testing. They only surface when someone compares actual output against expected output and notices the numbers don\'t match. The fix is trivial. Finding it isn\'t.',
      },
    ],
  },
  {
    title: 'When Your Query Misses Half the Data: Fixing Ongoing Session Detection in MongoDB',
    tag: 'performance',
    date: 'Dec 2025',
    content: [
      {
        heading: '',
        body: 'A resource utilization dashboard was showing numbers that felt off — utilization percentages that seemed too low, non-recorded time that was inflated. The calculations looked correct. The logic was sound. The data was wrong.',
      },
      {
        heading: 'The Problem',
        body: 'The API queried machine sessions within a date range. The query required both a start and a stop timestamp to be present and within range:\n\n```python\nquery[\'clockedHours.start.corrected\'] = {"$gte": req_date_from}\nquery[\'clockedHours.stop.corrected\'] = {"$lte": req_date_to}\n```\n\nThis completely excluded any session that was still ongoing — no stop field recorded yet. It also excluded sessions that started before the query window but were still running during it. Both are completely valid production states.',
      },
      {
        heading: 'What Was Being Missed',
        body: 'Five scenarios matter for a utilization range query. The original query only handled two of them correctly. Sessions that started before the range and hadn\'t stopped yet, sessions that started during the range and were still running — all invisible to the API. In a real factory floor context, a machine that\'s been running for 12 hours straight across a shift boundary just doesn\'t exist, as far as the report is concerned.',
      },
      {
        heading: 'The Fix',
        body: 'Restructuring the query with $or and $exists:\n\n```python\nquery[\'clockedHours.start.corrected\'] = {\'$lte\': req_date_to}\nquery[\'$or\'] = [\n    {\'clockedHours.stop.corrected\': {\'$gte\': req_date_from}},\n    {\'clockedHours.stop\': {\'$exists\': False}}\n]\n```\n\nThe first condition catches completed sessions overlapping the window. The second catches anything still running. Combined, they cover all five valid scenarios.',
      },
      {
        heading: 'The Cascade Effect',
        body: 'Once the query was fixed, nonRecorded time — which is calculated as available capacity minus (utilization + nonUtilization) — corrected itself automatically. The formula was never wrong. It was just being fed incomplete utilization data, so the "unaccounted" time was being inflated by sessions that were running but invisible. Fix the query, and the downstream metric fixes itself.',
      },
      {
        heading: 'The Lesson',
        body: 'When fields are optional — like a stop timestamp on an active session — queries that require them will silently exclude real data. In MongoDB especially, a missing field and a null field are not the same thing, and neither behaves the same as a field with a value. Always test your queries against all valid document shapes, not just the completed/clean ones.',
      },
    ],
  },
];
