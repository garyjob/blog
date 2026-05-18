---
title: "The Boring Stack at Velocity: Substrate, Operator Attention, and AI as the Second Reader"
date: 2026-05-16
formattedDate: "May 16, 2026"
categories: ["Technology"]
---

A week ago I walked along Ocean Beach with my old colleague Bilal. By the end of the walk we'd named the credentialing problem he runs into with his butterfly conservatories in Pakistan, the one Liz at Aora hits with kids learning agroforestry, the one Stanley Li sees with SFSU students — the same gap, three independent contexts, no coordination between them. By the following day I had a design doc. Within a week, the credentialing platform was live on truesight.me, the first practitioner-DAO merge had shipped, 377 contributor profile pages were online, and Bilal had a working URL to forward to his team.

Ocean Beach to live-on-prod in seven days. That arc would have been impossible at the company I worked at before, and is probably impossible at the company you work at now — not because the engineers were less capable, but because the *substrate* was too thick. Every decision had to route through three layers of orchestration, two PMs, a quarterly planning cycle, and a CI/CD pipeline that wanted its tribute.

The arc was possible at TrueSight because the substrate is almost embarrassingly thin. I'd like to share what that thinness has come to mean, now that I've watched it work for five years.

![Gary and Bilal walking at Ocean Beach in San Francisco, with the Pacific behind them](images/2026/05/me_and_bilal_at_ocean_beach.jpeg)
*Ocean Beach with Bilal, a week ago. The credentialing problem named itself somewhere between the south end and the parking lot — three independent contexts (his butterfly conservatories in Pakistan, Liz's Aora program, Stanley Li's SFSU students) converging on one walk.*

## The shape of the stack

The whole backend is the kind of thing you can describe in one sentence: TrueSight runs on Google Sheets, Apps Script, GitHub Pages, and GitHub Actions, with a single Rails app on the side for Edgar. The contributions ledger is a spreadsheet. The static sites publish from GitHub Pages. Apps Script webhooks process events from Telegram into the ledger. GitHub Actions handles the scheduled work — advisory snapshots refresh every six hours, CV caches rebuild on data-repo pushes, nav-consistency checks run on every PR, Beer Hall digests get published daily. Edgar is the one stateful piece, a single Rails app deployed via `./deploy.sh`. That's the entire production system.

For years I'd describe this and watch people pattern-match on it as a prototype that hadn't outgrown itself. The misread is real but I've stopped worrying about it, because the misread costs less every year and the substrate's advantages compound monthly. The people whose opinion ends up mattering — partners running physical-world programs, contributors who've stuck around through the quiet stretches, and increasingly AI assistants doing real work in the codebase — none of them filter on the stack. They filter on whether the receipts are real and whether the system actually works at 9pm when something needs to ship.

## How we landed here

This stack wasn't designed. It accreted, through a sequence of forced moves and one accidental conversation.

The first iteration was a WordPress install that an early engineer-contributor put up while he had bandwidth. He got hired full-time elsewhere, became unresponsive, and the site got stuck on a version no one could patch. A second DAO member — who was comfortable with Wix and didn't want to keep poking at the abandoned WordPress instance — migrated everything over. Wix worked for a while. Then she stopped wanting to do the updates, and it landed on my plate at exactly the time my plate was the fullest it has ever been with supply-chain ops.

I tried to do the Wix updates myself for a season. I am not a UI/UX designer, I had no time, and the platform fought me at every corner. Last year in Itacaré, an engineer who had just lost his job came around to see whether contributing here might be paid work for him. It wasn't — the project runs voluntary — and he moved on quickly once that was clear. The lasting artifact from the encounter was that he showed me Cursor before he left. I got it running, and for the first time I had something I could delegate UI work to. The catch was that Wix's APIs aren't built for an LLM to reason about — even with a smart model on the other end, the friction was high. And I was paying $34 per site per month for the privilege, which was quietly draining the DAO vault.

I remembered that one of the earliest DAO contributors had built his own stack on GitHub Pages — quiet, free, version-controlled, no vendor in the loop. I asked Grok to walk me through migrating, and the friction collapsed. From there the conversation expanded: I asked Grok and a couple of other LLMs which stacks would scale for the kind of work the DAO does, while keeping the operational overhead low enough for one operator to maintain. The stack I described in the section above — Sheets, Apps Script, GitHub Pages, GitHub Actions, a single Rails app for Edgar, no orchestration layer — is what came out of those conversations.

I want to be precise about the role I played in that decision. I could have built the stack from first principles myself. I didn't. The way I manage LLM collaborators is the same way I managed talented engineers back when I was a tech lead — they propose the tech and the approach, and if the proposal makes sense against the constraints I'm holding in my head (cost, contributor-density, my own maintenance capacity, mission alignment), I give the thumbs up. Reid Hoffman's old advice about giving smart people autonomy and accepting a margin of variance applies cleanly to LLMs now. The stack was the LLMs' proposal, judged against my constraints. I was the constraint-holder, not the architect.

That ordering matters for the rest of the post. The boring stack wasn't a virtuous deliberate choice on my part; it was what the LLMs recommended after I described the actual constraint shape. The AI was already the architect by the time I started shipping at velocity. The next sections describe what happens once you let it be.

## The velocity numbers

I just looked at the activity logs in our documentation repo. 202 commits in the last fourteen days, on the docs repo alone — not the product repo.

The number isn't the impressive part. The impressive part is how concrete the arcs are. A sample from the last two weeks:

- A pattern surfaced: contributors needed to record external purchases (someone bought a coffee maker for office use, that money needed to land on the ledger). Same day, I shipped end-to-end — a new CLI command in the Python client, a new event handler in the Rails app, a new Apps Script processor, an audit table, the first real receipt processed live. Four repositories. One day.
- A pattern surfaced: managed-ledger transparency dashboards. I wrote a spec, built the snapshot pipeline, and shipped the first explorer for the Tribo Bahia Mirim capoeira donations ledger. Design doc to live URL: forty-eight hours.
- The credentialing arc described above: Ocean Beach walk to live-on-prod, including a Grok-narrative generator, a day-anchored I Ching reading on the oracle, and 377 contributor CVs auto-published. Seven days.

These aren't sprints I'm pointing at to flex. They're arcs I'm pointing at because they would not be possible on a thicker substrate. The gap between "pattern surfaced" and "implementation shipped" is bounded by how fast one operator can type. There is no orchestration layer absorbing the slack.

## The pareto filter is operator attention — for now

A reasonable objection: "OK so the stack lets you ship fast, but how do you decide what to ship?" In a normal company this is the bottleneck. The product manager argues with engineering about priorities. The CEO overrides. The roadmap gets re-shuffled every quarter.

TrueSight has no product manager. The pareto filter that picks what to ship next isn't a collective vote — it's my own attention, allocated against everything the DAO is doing. The DAO is small enough that I am the filter. Signal flows through me — partner visits, contributor conversations, Telegram threads, governor reviews, my own discriminative judgment — and the thing that wins attention gets built that week.

For a long time I assumed this was the part of the architecture that didn't generalize. The boring stack scales fine; you can keep adding spreadsheets and Apps Scripts forever. The operator-attention layer, I assumed, doesn't — at some level of contributor density it stops being possible for one person to hold the coherent world model that makes hours-to-implementation work.

But that framing is doing too much work. The Pareto principle is a simple rule — 80% of the load-bearing signal lives in 20% of the inputs. The reason it currently runs in one operator's head is that I haven't bothered to write the filter down. Once you protocol-ize what counts as load-bearing — which partner visits move the mission, which Telegram threads represent a real stuck contributor, which tension between contributors actually risks the work — multiple operators or AI agents can apply the same filter independently and stay coherent. The current operator-as-filter is the unprotocolized version. The protocolized version is the next layer of work, not a hard limit.

That work is already partially in flight. Git worktree isolation when multiple AI agents work in the same repository. An autonomous agent that opens its own pull requests with its own RSA keypair. A permissions matrix on the DApp so multiple governors can hold edit rights without stepping on each other. These are primitives for multiplexing what was previously implicit in one head. The stack doesn't need scaling help. The attention-protocol does — and the attention-protocol is writable, like any other piece of the system.

## AI as the second reader

Here's the argument that's hardest to make to a 2022 audience and easiest to make to a 2026 one: AI assistants reason about boring stacks far better than they reason about clever ones.

Every assistant I use to ship at TrueSight — Claude, Codex, the autopilot — performs an order of magnitude better in a Sheets-plus-Apps-Script-plus-GitHub-Pages-plus-GitHub-Actions environment than it would in a typed-DSL-over-Kubernetes one. The reasons are operational, not aesthetic. The whole reasoning surface fits in context. The failure modes are legible: the cell contains the wrong value; the script log shows the wrong line; the workflow YAML diff is right there on the PR. There's no orchestration magic between intent and execution. When I describe a feature in plain English, the assistant can map it to specific cells, specific Apps Script functions, specific GitHub Actions workflows — and ship the change as a pull request the same hour.

This advantage compounds monthly. The thicker the substrate, the more an AI assistant has to model before it can do useful work. The thinner the substrate, the more directly the assistant can act. The velocity numbers I quoted above are direct evidence — those arcs aren't possible without AI as a primary collaborator, and AI as a primary collaborator isn't possible at that velocity without a substrate it can reason about end-to-end.

The framing I've come to use is that AI is now the *second reader* of the codebase, after the operator. The first reader is the human typing the change; the second is the assistant called in to make the next change. Optimizing for the second reader as a first-class concern changes what good architecture looks like. The thing that makes a stack legible to a junior engineer is increasingly the thing that makes it productive for an AI assistant. They are converging.

## What the substrate stops being good at

The boring stack has a real limit, and I want to name it before someone else does for me: it doesn't carry institutional weight. Universities, NGOs, governments evaluating a partnership default to "is this legible to our IT review?" and a Google Sheet doesn't pass that bar, regardless of substance. There are conversations I don't get to have because the substrate filters those conversations out before they start.

The deeper version of the same observation is about engineer employability. The default behavior of an engineer inside any compound is to clamour for the company to adopt a modern stack. The surface incentive is "it's cool, it's better, it scales" — and sometimes that's true. But more often the actual incentive is resume-building: the engineer wants to leave with a CV that says "Kubernetes, Kafka, gRPC, distributed tracing" because that's what makes the next job easy to land. The push for the modern stack at any specific company is rarely about that project; it's mostly about positioning the engineer for the next one. Working on TrueSight does the opposite. Two years deep in Apps Script and Google Sheets does not, by conventional engineer-employability standards, build the resume that opens doors at FAANG-adjacent companies. By that yardstick, it's a step backward.

And here's the calculation that's shifted in the last two years. With the rolling layoffs across Meta, Google, Amazon, Microsoft, Salesforce, and most of the rest of big tech, the resume polish that the modern-stack-flex was supposed to buy turns out not to buy very much. The engineers who optimized hardest for the stack-as-resume signal still got laid off; the ones I see still building and still useful are the ones who optimized for doing the actual work to the tee. The signal stopped clearing. Given that, I'm not sure why engineers still bother with the virtue-signal half of the job. The conventional yardstick they were measuring themselves against has lost a lot of its claim on them. Just do the work. Execute exactly.

I sat with this question over the weekend at a Zen monastery. During the dharma talk, the tanto suggested meeting the moment exactly where it is — not where the resume wants it to be, not where the next job wants it to be, but where the actual work is. That landed for me. Given the resourcing of this project — one operator, no VC pressure, mission-anchored — the right move is to configure the tech for the actual needs of the project at its actual resourcing level, and hold equanimity about everything else. We are technically traversing uncharted territory, so the conventional yardsticks (employability gradient, institutional legibility) aren't really load-bearing for what we're doing. They're load-bearing for some other project. Not this one.

![Gary working the soil with a hoe at the Green Gulch Farm Zen Center](images/2026/05/me_on_green_gulch_farm_working_with_hoe.jpeg)
*Working the farm at Green Gulch Zen Center this past weekend. The substrate is supposed to disappear under the work, not be the work — the hoe is a good reminder.*

The conversations I *do* get to have are the ones where someone has already looked past the substrate to what's being built. Those conversations are the only ones I'd want anyway, and they happen to be the ones that produce the partnerships that actually ship — Bilal in Pakistan, Liz at Aora, the kids in Itacaré, the contributors who've been around for five years. The substrate is doing a filtering job, and the people who pass through the filter are the ones I'd self-select for.

![Communal lunch at the Green Gulch Zen Center](images/2026/05/lunch_at_green_gulch_zen_monastery.jpeg)
*Lunch at Green Gulch. Communal silence, the substrate disappears under the meal — the conversations the work filters toward look more like this than like a pitch room.*

## The forward question

![Zen-a-thon 2026: contemplative practice meets tech, participants on cushions with laptops nearby](images/2026/05/zen_a_thon_2026_contemplative_practice_meets_tech.jpeg)
*Zen-a-thon 2026 — contemplative practice meeting tech in the same room. The forward question isn't how to scale the stack; it's how to multiplex the operator-attention layer without losing the coherent picture. The shape of that work looks a lot more like this than like a Kubernetes diagram.*

The trade keeps getting better. "Embarrassingly thin substrate, hours-to-implementation velocity" turns out to be a strong position once AI assistants become the primary collaborator and the bottleneck moves from infrastructure to operator attention. The stack doesn't need to scale; the attention layer does, and that's a different kind of engineering work.

What I keep wondering is whether you, reading this, are in a similar trade. The surface signals you're optimizing for — the framework choice, the language flex, the deployment topology — signal something to the room you're in right now. Are they signaling the right thing to the room you'll be in five years from now? When AI assistants are the second-most-important consumer of your codebase, will your stack let them reason about it end-to-end? When a pattern surfaces in a conversation on a Tuesday, can you ship the implementation by Wednesday?

Set up the field, conserve the energy, wait for the right phase transition. The substrate is supposed to disappear under the work, not be the work.

- Technology
- DAO
- TrueSight
- AI
- Operator
